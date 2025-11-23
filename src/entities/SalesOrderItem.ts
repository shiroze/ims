import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SalesOrder } from './SalesOrder';
import { ProductVariant } from './ProductVariant';

@Entity('sales_order_items')
export class SalesOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  salesOrderId!: string;

  @Column({ type: 'uuid' })
  productVariantId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total!: number;

  @ManyToOne(() => SalesOrder)
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder!: SalesOrder;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'productVariantId' })
  productVariant!: ProductVariant;
}

