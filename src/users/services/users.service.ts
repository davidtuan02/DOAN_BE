import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ErrorManager } from '../../utils/error-manager.util';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO, UserToProjectDTO, UserUpdateDTO } from '../dto/user.dto';
import { UsersEntity } from '../entities/user.entity';
import { UsersProjectsEntity } from '../entities/usersProjects.entity';
import { ROLES } from '../../constants/roles-enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(UsersProjectsEntity)
    private readonly userProjectRepository: Repository<UsersProjectsEntity>,
  ) {}

  public async createUser(body: UserDTO): Promise<UsersEntity> {
    try {
      console.log('Starting createUser service with body:', JSON.stringify(body, null, 2));
      
      // Check if email or username already exists
      console.log('Checking for existing user...');
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: body.email },
          { username: body.username }
        ]
      });

      if (existingUser) {
        console.log('User already exists:', JSON.stringify(existingUser, null, 2));
        throw new Error('Email or username already exists');
      }

      // Hash password with proper salt handling
      console.log('Hashing password...');
      const saltRounds = 10;
      console.log('Using salt rounds:', saltRounds);
      body.password = await bcrypt.hash(body.password, saltRounds);

      // Create new user
      console.log('Creating new user...');
      const newUser = this.userRepository.create({
        firstName: body.firstName,
        lastName: body.lastName,
        age: body.age,
        email: body.email,
        username: body.username,
        password: body.password,
        role: body.role || ROLES.BASIC
      });
      
      console.log('Created user object:', JSON.stringify(newUser, null, 2));
      const savedUser = await this.userRepository.save(newUser);
      console.log('User saved successfully:', JSON.stringify(savedUser, null, 2));
      return savedUser;
    } catch (error) {
      console.error('Error in createUser service:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      if (error.message === 'Email or username already exists') {
        throw error;
      }
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findUsers(): Promise<UsersEntity[]> {
    try {
      const users: UsersEntity[] = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .getMany();

      if (users.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return users;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findUserById(id: string): Promise<UsersEntity> {
    try {
      const user: UsersEntity = await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
        .leftJoinAndSelect('projectsIncludes.project', 'project')
        .getOne();
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async relationToProject(body: UserToProjectDTO) {
    try {
      return await this.userProjectRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof UserDTO; value: any }) {
    try {
      const user: UsersEntity = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where({ [key]: value })
        .getOne();

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async updateUser(
    body: UserUpdateDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const user: UpdateResult = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }

  public async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      const user: DeleteResult = await this.userRepository.delete(id);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureMessage(error.message);
    }
  }
}
