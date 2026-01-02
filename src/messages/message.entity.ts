import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export type MessageStatus = 'sent' | 'seen';

@Entity('messages')
export class Message {
  @ObjectIdColumn()
  _id: ObjectId;

  // ✅ conversation participants
  @Column()
  fromUserId: string; // store ObjectId as string

  @Column()
  toUserId: string;   // store ObjectId as string

  @Column()
  content: string;

  @Column({ default: 'sent' })
  status: MessageStatus;

  @CreateDateColumn()
  createdAt: Date;
}
