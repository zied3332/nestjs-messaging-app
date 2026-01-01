import { IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  content: string;

  // Mongo ObjectId arrives as string from client
  @IsString()
  userId: string;
}
