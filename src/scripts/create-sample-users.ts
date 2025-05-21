import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { faker } from '@faker-js/faker';
import { UsersService } from '../users/services/users.service';
import { ROLES } from '../constants/roles-enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const users = Array.from({ length: 10 }, () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: faker.datatype.number({ min: 18, max: 60 }),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: 'Password123!',
    role: ROLES.BASIC,
  }));

  console.log('Creating sample users...');
  
  const usersService = app.get(UsersService);

  for (const user of users) {
    try {
      await usersService.createUser(user);
      console.log(`Created user: ${user.email}`);
    } catch (error) {
      console.error(`Failed to create user ${user.email}:`, error.message);
    }
  }

  console.log('Sample users creation completed!');
  await app.close();
}

bootstrap();