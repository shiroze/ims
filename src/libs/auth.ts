import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { getTranslations } from 'next-intl/server';
import bcrypt from 'bcryptjs';
import { initializeDatabase } from "~/libs/typeorm";
import { User } from "~/entities/User";
import { Roles } from "~/entities/Roles";
import { RoleDetails } from "~/entities/RoleDetails";
import { Menu } from "~/entities/Menu";
import { In } from "typeorm";
 
export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth
} = NextAuth({
  // Note: Adapter is not needed when using Credentials provider with JWT strategy
  // The adapter is only needed for database-backed sessions or OAuth providers
  providers: [
    Credentials({
      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      name: "Credentials",
      credentials: {
        username: {
          label: 'Username',
          type: 'text'
        },
        password: {
          label: 'Password',
          type: 'password',
        }
      },
      /**
       * Verify the username and password supplied against a database or service.
       * The function should return a user object if the credentials are valid, or null if not.
       * The user object should contain at least the following properties:
       * - id: a unique identifier for the user
       * - name: the name of the user
       * - email: the email address of the user
       * - role: the role of the user (e.g. "Admin", "User")
       * @param {Object} credentials Contains the username and password supplied by the user.
       * @returns {Promise<Object | null>} A user object if the credentials are valid, or null if not.
       */
      async authorize(credentials, request) {
        // Type guard for credentials
        if (!credentials || typeof credentials !== 'object') {
          return null;
        }

        const username = credentials.username as string | undefined;
        const password = credentials.password as string | undefined;

        if (!username || !password) {
          return null;
        }

        try {
          // Initialize database connection
          const dataSource = await initializeDatabase();
          const userRepository = dataSource.getRepository(User);
          const rolesRepository = dataSource.getRepository(Roles);
          const roleDetailsRepository = dataSource.getRepository(RoleDetails);
          const menuRepository = dataSource.getRepository(Menu);

          // Find user by username
          const user = await userRepository.findOne({
            where: { UserName: username, IsActive: true }
          });

          if (!user) {
            // User not found - throw error with specific code
            // NextAuth v5 will catch this, but we can handle it in the login page
            const error = new Error('UserNotFound');
            (error as any).code = 'UserNotFound';
            throw error;
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(password, user.UserPass);
          
          if (!isPasswordValid) {
            // Password invalid - throw error with specific code
            const error = new Error('InvalidPassword');
            (error as any).code = 'InvalidPassword';
            throw error;
          }

          // Get user role
          const role = await rolesRepository.findOne({
            where: { RoleId: user.RoleId, IsActive: true }
          });

          if (!role) {
            // Role not found - throw error with specific code
            const error = new Error('RoleNotFound');
            (error as any).code = 'RoleNotFound';
            throw error;
          }

          // Get user permissions from role details
          const roleDetails = await roleDetailsRepository.find({
            where: { RoleId: user.RoleId }
          });

          // Get menu permissions
          const menuIds = roleDetails.map(rd => rd.MenuId);
          const menus = menuIds.length > 0 
            ? await menuRepository.find({
                where: { MenuId: In(menuIds), IsActive: true }
              })
            : [];

          // Build permissions array
          const permissions: string[] = [];
          roleDetails.forEach(rd => {
            const menu = menus.find(m => m.MenuId === rd.MenuId);
            if (menu) {
              if (rd.IsView) permissions.push(`${menu.MenuCode}:view`);
              if (rd.IsAdd) permissions.push(`${menu.MenuCode}:add`);
              if (rd.IsEdit) permissions.push(`${menu.MenuCode}:edit`);
              if (rd.IsDelete) permissions.push(`${menu.MenuCode}:delete`);
              if (rd.IsPrint) permissions.push(`${menu.MenuCode}:print`);
              if (rd.IsExport) permissions.push(`${menu.MenuCode}:export`);
              if (rd.IsImport) permissions.push(`${menu.MenuCode}:import`);
              if (rd.IsApprove) permissions.push(`${menu.MenuCode}:approve`);
              if (rd.IsReject) permissions.push(`${menu.MenuCode}:reject`);
              if (rd.IsCancel) permissions.push(`${menu.MenuCode}:cancel`);
            }
          });

          // Update last login
          user.LastLogin = new Date();
          await userRepository.save(user);

          return {
            id: user.UserId.toString(),
            username: user.UserName,
            name: user.Name,
            email: user.UserEmail,
            role_id: role.RoleId,
            role: role.RoleName,
            permissions: permissions,
            token: '', // You can generate a JWT token here if needed
          };
        } catch (error: any) {
          console.error('Authentication error:', error);
          // Re-throw the error - NextAuth v5 will catch it
          // The error code will be available in the error response
          throw error;
        }
      }
    }),
  ],
  secret: process.env.AUTH_SECRET,
  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 60 * 30 // 30 minutes // 24 * 60 * 60 * 30 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login',
    error: '/login' // Redirect errors back to login page
  },
  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // This callback is called after authorize
      // We can use it to validate but errors are already handled in authorize
      return true;
    },
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        token.id = user.id as string;
        token.username = (user as any).username as string;
        token.name = user.name as string;
        token.role_id = user.role_id;
        token.role = (user as any).role as string;
        token.permissions = (user as any).permissions as string[];
        token.accessToken = (user as any).token as string; // ** Access token from the API response
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
        session.user.name = token.name as string;
        session.user.role_id = token.role_id as number;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
        (session.user as any).accessToken = token.accessToken as string; // ** Access token from the API response
      }

      return session
    },
  }
})