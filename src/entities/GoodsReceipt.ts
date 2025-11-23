// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
// import { User } from './User';
// import { GoodsReceiptItem } from './GoodsReceiptItem';

// @Entity('goods_receipts')
// export class GoodsReceipt {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Column({ type: 'varchar', length: 255, unique: true })
//   grNumber!: string;

//   @Column({ type: 'datetime' })
//   date!: Date;

//   @Column({ type: 'uuid' })
//   purchaseOrderId!: string;

//   @Column({ type: 'int' })
//   userId!: number;

//   @Column({ 
//     type: 'enum', 
//     enum: ['draft', 'confirmed', 'cancelled'],
//     default: 'draft'
//   })
//   status!: 'draft' | 'confirmed' | 'cancelled';

//   @Column({ type: 'text', nullable: true })
//   notes?: string;

//   @ManyToOne(() => User)
//   @JoinColumn({ name: 'userId' })
//   user!: User;

//   @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt)
//   items!: GoodsReceiptItem[];
// }

