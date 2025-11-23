import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('t_menu')
export class Menu {
  @PrimaryGeneratedColumn()
  MenuId!: number;

  @Column({ type: 'varchar', length: 50 })
  MenuCode!: string;

  @Column({ type: 'varchar', length: 50 })
  MenuAction!: string;

  @Column({ type: 'varchar', length: 50 })
  MenuUrl!: string;

  @Column({ type: 'varchar', length: 50 })
  MenuName!: string;

  @Column({ type: 'varchar', length: 50 })
  ParentId!: string;

  @Column({ type: 'varchar', length: 50 })
  MenuIcon!: string;

  @Column({ type: 'int' })
  MenuOrder!: number;

  @Column({ type: 'boolean', default: true })
  IsShow!: boolean;

  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;
}

