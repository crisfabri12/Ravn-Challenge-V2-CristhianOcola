import { UsersService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
    usersService = new UsersService(prismaService);
    prismaService.cleanDb();
  });

  afterEach(async () => {
    prismaService.cleanDb();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const createdUser = await usersService.create(userData);

      expect(createdUser).toBeDefined();
      expect(createdUser.email).toEqual(userData.email.toLowerCase());
      expect(createdUser.name).toEqual(userData.name.toLowerCase());
      expect(createdUser.lastName).toEqual(userData.lastName.toLowerCase());

      // Verify password is hashed
      expect(createdUser.password).not.toEqual(userData.password);
    });
  });

  describe('findOne', () => {
    it('should find a user by email', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      // Create a test user
      await usersService.create(userData);

      // Find the created user
      const foundUser = await usersService.findOne(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toEqual(userData.email.toLowerCase());
      expect(foundUser?.name).toEqual(userData.name.toLowerCase());
      expect(foundUser?.lastName).toEqual(userData.lastName.toLowerCase());
    });

  });

  describe('getById', () => {
    it('should find a user by id', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      // Create a test user
      const createdUser = await usersService.create(userData);

      // Find user by ID
      const foundUser = await usersService.getById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toEqual(userData.email.toLowerCase());
      expect(foundUser?.name).toEqual(userData.name.toLowerCase());
      expect(foundUser?.lastName).toEqual(userData.lastName.toLowerCase());
    });

  describe('updatePassword', () => {
    it('should update the password of a user', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      // Create a test user
      const createdUser = await usersService.create(userData);

      // New password
      const newPassword = 'newPassword123';

      // Update user password
      await usersService.updatePassword(createdUser.id, newPassword);

      // Find user and verify password is updated
      const updatedUser = await usersService.getById(createdUser.id);
      const isPasswordUpdated = await bcrypt.compare(newPassword, updatedUser.password);

      expect(isPasswordUpdated).toBe(true);
    });
  });
});
});
