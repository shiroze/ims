import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  soNumber!: string;

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'uuid' })
  partnerId!: string;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ 
    type: 'enum', 
    enum: ['draft', 'confirmed', 'delivered', 'cancelled'],
    default: 'draft'
  })
  status!: 'draft' | 'confirmed' | 'delivered' | 'cancelled';

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;
}

