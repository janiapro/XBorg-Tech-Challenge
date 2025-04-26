import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, NotFoundException } from '@nestjs/common';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserRepository } from '../user.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '../../prisma/constants';
import { mockCreateUser, mockUser } from './mocks';

// Unit test suite for UserRepository
describe('UserRepository', () => {
  let userRepository: UserRepository;

  // Create a stubbed PrismaService using ts-sinon
  const mockPrismaService: StubbedInstance<PrismaService> =
    stubInterface<PrismaService>();

  // Set up the repository and mocked PrismaService before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        UserRepository,
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  // Test the find method
  describe('find', () => {
    it('should successfully find user', async () => {
      // Arrange: mock Prisma to resolve with a user
      mockPrismaService.user.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockUser);

      // Act: call the repository method
      const user = await userRepository.find({ id: mockUser.id });

      // Assert: check the result
      expect(user).toEqual(mockUser);
    });

    it('should return a NotFoundException for an invalid id', async () => {
      // Arrange: mock Prisma to reject with NotFoundException
      mockPrismaService.user.findUniqueOrThrow = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      // Act & Assert: expect the repository to throw NotFoundException
      await expect(userRepository.find({ id: 'invalidId' })).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  // Test the create method
  describe('create', () => {
    it('should successfully create user', async () => {
      // Arrange: mock Prisma to resolve with a user
      mockPrismaService.user.create = jest.fn().mockResolvedValue(mockUser);

      // Act: call the repository method
      const user = await userRepository.create(mockCreateUser);

      // Assert: check the result
      expect(user).toEqual(mockUser);
    });

    it('should fail to create user with UNIQUE_CONSTRAINT code', async () => {
      // Arrange: mock Prisma to reject with a unique constraint error
      const error = new Error() as any;
      error.code = ERROR_CODES.UNIQUE_CONSTRAINT;
      mockPrismaService.user.create = jest.fn().mockRejectedValue(error);

      // Act & Assert: expect the repository to throw a 409 HttpException
      await expect(userRepository.create(mockCreateUser)).rejects.toThrow(
        new HttpException('User exists', 409),
      );
    });

    it('should fail to create user with error code', async () => {
      // Arrange: mock Prisma to reject with a generic error
      const error = new Error('Error') as any;
      error.code = 404;
      mockPrismaService.user.create = jest.fn().mockRejectedValue(error);

      // Act & Assert: expect the repository to throw a generic error
      await expect(userRepository.create(mockCreateUser)).rejects.toThrow(
        new Error('Failed to create user'),
      );
    });
  });
});
