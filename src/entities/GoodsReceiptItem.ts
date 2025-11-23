// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { GoodsReceipt } from './GoodsReceipt';
// import { ProductVariant } from './ProductVariant';

// @Entity('goods_receipt_items')
// export class GoodsReceiptItem {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Column({ type: 'uuid' })
//   goodsReceiptId!: string;

//   @Column({ type: 'uuid' })
//   purchaseOrderItemId!: string;

//   @Column({ type: 'uuid' })
//   productVariantId!: string;

//   @Column({ type: 'decimal', precision: 15, scale: 2 })
//   quantity!: number;

//   @ManyToOne(() => GoodsReceipt)
//   @JoinColumn({ name: 'goodsReceiptId' })
//   goodsReceipt!: GoodsReceipt;

//   @ManyToOne(() => ProductVariant)
//   @JoinColumn({ name: 'productVariantId' })
//   productVariant!: ProductVariant;
// }

