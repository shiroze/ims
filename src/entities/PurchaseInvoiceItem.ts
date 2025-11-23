import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('t_purchase_invoices_details')
export class PurchaseInvoiceItem {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  InvoiceNo!: string;

  @Column({ type: 'varchar', length: 50 })
  PrNo!: string;

  @Column({ type: 'varchar', length: 50 })
  ItemId!: string;

  @Column({ type: 'integer' })
  VariantId!: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  Qty!: number;

  @Column({ type: 'integer', default: 0 })
  UnitId!: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  price!: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  Discount!: number;

  @Column({ type: 'integer', default: 0 })
  TaxRate!: number;
  
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  TaxTotal!: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  Total!: number;

  @Column({ type: 'text' })
  Remarks?:string;

  @Column({ type: 'integer', default: 0 })
  IndexNo!: number;
  
  @Column({ type: 'boolean', default: false })
  REMOVED?: boolean;

  @Column({ type: 'varchar', length: 250 })
  ReasonCancel?:string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserName' })
  CreatedBy!: User;
  
  @Column({ type: 'datetime' })
  CreatedDate!: Date;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserName' })
  UpdatedBy?: User;
  
  @Column({ type: 'datetime' })
  UpdatedDate?: Date;
}

