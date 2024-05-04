import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartsService } from '../services/carts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetCurrentUserId } from '../../auth/decorators/get-current-user-id.decorator';
import { UpdateCartDto } from '../dto/update-cart-dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ValidBody } from '../../utils/decorators';
import { CartDto } from '../dto/cart-dto';


@Controller('carts')
@ApiTags('Cart')
@UseInterceptors(ClassSerializerInterceptor)
export class CartsController {
  constructor(private cartsService: CartsService) {}

  @Post('/')
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: "Checkout the current user's cart and create an order.",
  })
  @ApiResponse({ status: 200, description: 'The checkout was successful.' })
  @ApiResponse({
    status: 400,
    description: 'The checkout failed due to invalid input.',
  })
  @UseGuards(JwtAuthGuard)
  async checkoutCart(@GetCurrentUserId() userId: number) {
    return this.cartsService.checkoutCart(userId);
  }

  @Patch('/')
  @ApiBearerAuth('access_token')
  @ApiBody({
    type: UpdateCartDto,
    description:
      'The product IDs and their quantities to be updated in the cart.',
  })
  @ApiOperation({
    summary: 'Add/Update/Delete items on the cart of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'The cart was updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'The update failed due to invalid input.',
  })
  @Roles(Role.MANAGER)
  @UseGuards(JwtAuthGuard)
  async updateCart(
    @GetCurrentUserId() userId: number,
    @ValidBody() updateCart: UpdateCartDto,
  ) {
    const updatedCart = await this.cartsService.updateItemCart(
      userId,
      updateCart,
    );
    return new CartDto(updatedCart);
  }

  @Get('/')
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary:
      "Get the current user's cart with all the items and the total price.",
  })
  @ApiResponse({
    status: 200,
    description: 'The cart was retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'The cart could not be found.' })
  @Roles(Role.MANAGER)
  @UseGuards(JwtAuthGuard)
  async getCart(@GetCurrentUserId() userId: number) {
    const cart = await this.cartsService.getOrCreateCart(userId);
    return new CartDto(cart);
  }

  @Delete('/')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: "Clear all the items in the current user's cart." })
  @ApiResponse({
    status: 200,
    description: 'The cart was cleared successfully.',
  })
  @ApiResponse({ status: 404, description: 'The cart could not be found.' })
  @UseGuards(JwtAuthGuard)
  async deleteCart(@GetCurrentUserId() userId: number) {
    return await this.cartsService.deleteCart(userId);
  }
}
