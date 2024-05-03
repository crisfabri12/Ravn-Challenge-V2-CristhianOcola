// delete-image.dto.ts

import { IsOptional, IsNumber, IsString } from 'class-validator';

export class DeleteImageDto {
  @IsOptional()
  @IsNumber({}, { message: 'ID to Image' })
  id?: number;

  @IsOptional()
  @IsString({ message: 'The name to Image' })
  filename?: string;
}
