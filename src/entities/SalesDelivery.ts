import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { SalesOrder } from './SalesOrder';
import { SalesDeliveryItem } from './SalesDeliveryItem';

@Entity('sales_deliveries')
export class SalesDelivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  deliveryNumber!: string;

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'uuid' })
  salesOrderId!: string;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ 
    type: 'enum', 
    enum: ['draft', 'confirmed', 'cancelled'],
    default: 'draft'
  })
  status!: 'draft' | 'confirmed' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => SalesOrder)
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder!: SalesOrder;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => SalesDeliveryItem, (item) => item.salesDelivery)
  items!: SalesDeliveryItem[];
}

