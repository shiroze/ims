import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('t_uom')
export class UoM {
  @PrimaryGeneratedColumn('increment')
  UomId!: number;

  @Column({ type: 'text' })
  UomCode!: string;

  @Column({ type: 'varchar', length: 50 })
  UomName!: string;

  @Column({ type: 'integer' })
  BaseUomId?: number;

  @Column({ type: 'integer' })
  BaseQty!: number;

  @Column({ type: 'varchar', length: 50, default: '*' })
  Operand!: string;

  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'CreatedBy', referencedColumnName: 'UserName' })
  CreatedBy!: User;
  
  @Column({ type: 'datetime' })
  CreatedDate!: Date;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'UpdatedBy', referencedColumnName: 'UserName' })
  UpdatedBy?: User;
  
  @Column({ type: 'datetime' })
  UpdatedDate?: Date;
}

