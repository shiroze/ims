import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SalesDelivery } from './SalesDelivery';
import { ProductVariant } from './ProductVariant';
import { SalesOrderItem } from './SalesOrderItem';

@Entity('sales_delivery_items')
export class SalesDeliveryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  salesDeliveryId!: string;

  @Column({ type: 'uuid' })
  salesOrderItemId!: string;

  @Column({ type: 'uuid' })
  productVariantId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quantity!: number;

  @ManyToOne(() => SalesDelivery)
  @JoinColumn({ name: 'salesDeliveryId' })
  salesDelivery!: SalesDelivery;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'productVariantId' })
  productVariant!: ProductVariant;

  @ManyToOne(() => SalesOrderItem)
  @JoinColumn({ name: 'salesOrderItemId' })
  salesOrderItem!: SalesOrderItem;
}

