import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['sent', 'seen'])
  status?: 'sent' | 'seen';
}
