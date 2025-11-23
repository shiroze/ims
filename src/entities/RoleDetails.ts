import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('t_roledetails')
export class RoleDetails {
  @PrimaryGeneratedColumn()
  RoleDetailsId!: number;

  @Column({ type: 'int' })
  RoleId!: number;

  @Column({ type: 'int' })
  MenuId!: number;

  @Column({ type: 'boolean', nullable: true })
  IsView?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsAdd?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsEdit?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsDelete?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsPrint?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsExport?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsImport?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsApprove?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsReject?: boolean;

  @Column({ type: 'boolean', nullable: true })
  IsCancel?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  CreatedBy?: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  CreatedDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  UpdatedBy?: string;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  UpdatedDate?: Date;
}

