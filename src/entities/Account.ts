import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  provider!: string;

  @Column({ type: 'varchar', length: 255 })
  providerAccountId!: string;

  @Column({ type: 'text', nullable: true })
  refresh_token?: string;

  @Column({ type: 'text', nullable: true })
  access_token?: string;

  @Column({ type: 'int', nullable: true })
  expires_at?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token_type?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  scope?: string;

  @Column({ type: 'text', nullable: true })
  id_token?: string;

  @Column({ type: 'text', nullable: true })
  session_state?: string;
}

