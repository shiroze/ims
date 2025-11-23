import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';

@Entity('t_itemgood_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('increment')
  VariantId!: number;

  @Column({ type: 'varchar', length: 50 })
  ItemId!: string;

  @Column({ type: 'varchar', length: 100 })
  VariantName!: string;

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

