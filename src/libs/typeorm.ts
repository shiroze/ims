import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '~/entities/User';
import { Menu } from '~/entities/Menu';
import { Roles } from '~/entities/Roles';
import { RoleDetails } from '~/entities/RoleDetails';
import { Account } from '~/entities/Account';
import { Session } from '~/entities/Session';
import { VerificationToken } from '~/entities/VerificationToken';
import { Product } from '~/entities/Product';
import { ProductVariant } from '~/entities/ProductVariant';
import { UoM } from '~/entities/UoM';
// import { GoodsReceipt } from '~/entities/GoodsReceipt';
// import { GoodsReceiptItem } from '~/entities/GoodsReceiptItem';
// import { SalesOrder } from '~/entities/SalesOrder';
// import { SalesOrderItem } from '~/entities/SalesOrderItem';
// import { SalesDelivery } from '~/entities/SalesDelivery';
// import { SalesDeliveryItem } from '~/entities/SalesDeliveryItem';

// Decrypt function to decrypt DB_PASS
async function decryptPassword(encryptedPassword: string, secretKey: string): Promise<string> {
  try {
    if (!process.env.DB_MASTER_KEY) {
      throw new Error('Please set master key first !');
    }

    const masterKey = process.env.DB_MASTER_KEY as string;

    // helper: convert hex string to Uint8Array
    const hexToBytes = (hex: string) => {
      if (!hex) return new Uint8Array();
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      }
      return bytes;
    };

    // Use WebCrypto HKDF to derive a 32-byte key
    const subtle = (globalThis.crypto && (globalThis.crypto.subtle as SubtleCrypto));
    if (!subtle) throw new Error('WebCrypto SubtleCrypto is not available');

    const ikm = new TextEncoder().encode(secretKey);
    const salt = new TextEncoder().encode(masterKey);
    const info = new TextEncoder().encode('db-pass-decrypt');

    const baseKey = await subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
    const derivedBits = await subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, baseKey, 32 * 8);
    const derivedKey = new Uint8Array(derivedBits);

    const parts = encryptedPassword.split(':');
    const iv = hexToBytes(parts[0] || '');
    const authTag = hexToBytes(parts[1] || '');
    const encryptedHex = parts[2] || '';
    const encryptedBytes = hexToBytes(encryptedHex);

    // For WebCrypto AES-GCM, ciphertext should have the authTag appended
    const cipherWithTag = new Uint8Array(encryptedBytes.length + authTag.length);
    cipherWithTag.set(encryptedBytes, 0);
    cipherWithTag.set(authTag, encryptedBytes.length);

    const aesKey = await subtle.importKey('raw', derivedKey, { name: 'AES-GCM' }, false, ['decrypt']);
    const decryptedBuffer = await subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, cipherWithTag.buffer);
    const decrypted = new TextDecoder().decode(new Uint8Array(decryptedBuffer));
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt password:', error);
    return encryptedPassword; // Return as-is if decryption fails
  }
}

// Get database configuration
async function getDBConfig() {
  const dbName = process.env.DB_NAME || 'db_sis';
  const dbUser = process.env.DB_USER || 'root';
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = parseInt(process.env.DB_PORT || '3306');

  // Get dialect from environment or default to mariadb
  const dialect = process.env.DB_DIALECT || 'mariadb';

  // Handle encrypted password
  let dbPassword = process.env.DB_PASS || '';
  const isEncrypted = process.env.DB_PASS_ENCRYPTED === 'true';

  if (isEncrypted && dbPassword) {
    const secretKey = process.env.DB_SECRET_KEY;
    if (secretKey) {
      dbPassword = await decryptPassword(dbPassword, secretKey);
    } else {
      console.error('DB_SECRET_KEY is not set; unable to decrypt DB_PASS');
    }
  }

  return {
    dbname: dbName,
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    dialect: dialect,
  };
}

// Map dialect to TypeORM driver
const getType = (dialect: string): 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'mssql' => {
  switch (dialect.toLowerCase()) {
    case 'mariadb':
      return 'mariadb';
    case 'mysql':
      return 'mysql';
    case 'postgres':
      return 'postgres';
    case 'sqlite':
      return 'sqlite';
    case 'mssql':
      return 'mssql';
    default:
      return 'mariadb';
  }
};
// AppDataSource will be created during initialization (after async decryption)
export let AppDataSource: DataSource | undefined;

// Initialize connection
let isInitialized = false;

export async function initializeDatabase() {
  if (!isInitialized) {
    try {
      const config = await getDBConfig();

      // create DataSource with resolved password
      AppDataSource = new DataSource({
        type: getType(config.dialect),
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.dbname,
        entities: [
          User, Menu, Roles, RoleDetails, Account, Session, VerificationToken,
          Product, ProductVariant, UoM
        ],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        extra: config.dialect === 'postgres' ? {
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        } : undefined,
      });

      if (AppDataSource && !AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('TypeORM DataSource has been initialized');
      }

      isInitialized = true;
    } catch (error) {
      console.error('Error during DataSource initialization:', error);
      throw error;
    }
  }
  return AppDataSource;
}

// Initialize database on module load (for adapter)
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}

// Export the DataSource (may be undefined until initialized)
export default AppDataSource;

