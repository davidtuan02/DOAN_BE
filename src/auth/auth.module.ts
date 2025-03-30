import { Global, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersService } from '../users/services/users.service';
import { UsersModule } from '../users/users.module';
import { TeamRoleGuard } from './guards/team-role.guard';

@Global()
@Module({
  imports: [UsersModule],
  providers: [AuthService, UsersService, TeamRoleGuard],
  controllers: [AuthController],
  exports: [TeamRoleGuard],
})
export class AuthModule {}
