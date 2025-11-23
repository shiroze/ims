import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('t_itemgoods')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 50, unique: true })
  ItemId!: string;

  @Column({ type: 'text' })
  ItemName!: string;

  @Column({ type: 'integer' })
  UomId!: number;

  @Column({ type: 'integer' })
  CategoryId?: number;

  @Column({ type: 'integer' })
  BrandId?: number;

  @Column({ type: 'integer', default: 0 })
  MinQty!: number;

  @Column({ type: 'boolean', default: true })
  IsStock!: boolean;

  @Column({ type: 'text' })
  Descriptions?: string;

  @Column({ type: 'varchar', length: 255 })
  ItemImage!: string;

  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;

  @Column({ type: 'boolean', default: false })
  HasVariant!: boolean;

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

