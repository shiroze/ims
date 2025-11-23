import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  sessionToken!: string;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;

  @Column({ type: 'datetime' })
  expires!: Date;
}

