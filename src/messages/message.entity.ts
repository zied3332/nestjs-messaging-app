import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Message {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  content: string;

  @Column({ default: 'sent' }) // sent | seen
  status: string;

  // ✅ simple relation: store the user id
  @Column()
  userId: ObjectId;

  @CreateDateColumn()
  date: Date;
}
