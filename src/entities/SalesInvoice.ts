import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('t_sales_invoices')
export class SalesInvoice {
  @PrimaryColumn({ type: 'varchar', length: 50, unique: true })
  InvoiceNo!: string;

  @Column()
  CustomerId!: number;

  @Column({ 
    type: 'enum', 
    enum: ['1', '2'],
    default: '2'
  })
  InvoiceType!: '1' | '2';

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
  IsManual?: boolean;
  
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

