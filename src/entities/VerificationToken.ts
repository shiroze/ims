import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('verification_tokens')
export class VerificationToken {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  identifier!: string;

  @Column({ type: 'varchar', length: 255 })
  token!: string;

  @Column({ type: 'datetime' })
  expires!: Date;
}

