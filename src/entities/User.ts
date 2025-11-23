import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('t_users')
export class User {
  @PrimaryGeneratedColumn()
  UserId!: number;

  @Column({ type: 'varchar', length: 255 })
  UserName!: string;

  @Column({ type: 'varchar', length: 255 })
  UserPass!: string;

  @Column({ type: 'varchar', length: 255 })
  Name!: string;

  @Column({ type: 'varchar', length: 255 })
  UserEmail!: string;

  @Column({ type: 'varchar', length: 255 })
  UserPhone!: string;

  @Column({ type: 'int' })
  RoleId!: number;

  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  UserImage?: string;

  @Column({ type: 'datetime', nullable: true })
  LastLogin?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  CreatedBy?: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  CreatedDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  UpdatedBy?: string;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  UpdatedDate?: Date;
}

