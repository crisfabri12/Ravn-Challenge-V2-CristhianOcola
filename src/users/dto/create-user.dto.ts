import { Exclude } from 'class-transformer';

export class CreateUserDto {
  email: string;
  name: string;
  lastname: string;
  password: string;
}
