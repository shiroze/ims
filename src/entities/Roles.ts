import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('t_roles')
export class Roles {
  @PrimaryGeneratedColumn()
  RoleId!: number;

  @Column({ type: 'varchar', length: 50 })
  RoleName!: string;

  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  CreatedBy?: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  CreatedDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  UpdatedBy?: string;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  UpdatedDate?: Date;
}

