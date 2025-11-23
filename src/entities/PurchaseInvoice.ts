import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('t_purchase_invoices')
export class PurchaseInvoice {
  @PrimaryColumn({ type: 'varchar', length: 50, unique: true })
  InvoiceNo!: string;

  @Column()
  VendorId!: number;

  @Column({ type: 'date' })
  InvoiceDate!: Date;

  @Column({ type: 'date' })
  DueDate!: Date;
  
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  SubTotal!: number;
  
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  Discount!: number;
  
  @Column({ type: 'integer', default: 0 })
  TaxRate!: number;
  
  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  TaxTotal!: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  GrandTotal!: number;

  @Column()
  Descriptions?: string;
  
  @Column({ type: 'boolean', default: false })
  PRINTED!: boolean;

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

