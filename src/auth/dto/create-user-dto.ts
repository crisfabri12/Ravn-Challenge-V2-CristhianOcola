import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'El correo electrónico del usuario' })
  email: string;

  @ApiProperty({ description: 'El nombre del usuario' })
  name: string;

  @ApiProperty({ description: 'El apellido del usuario' })
  lastName: string;

  @ApiProperty({ description: 'La contraseña del usuario' })
  password: string;
}
