import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  username: string;

  // ✅ NEW: hashed password for JWT auth
  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
