import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';

interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

@Controller('users')
export class UserController {
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return {
      message: 'Authenticated user profile',
      user,
    };
  }
}
