import { SignUpDTO } from 'lib-server';

import { User } from '../../prisma/types/user.types';

export const mockFindUser = {
  id: 'uuid',
  userName: 'johndoe',
  address: 'someethaddress',
  email: 'johndoe@gmail.com',
};
export const mockUpdateUser = {
  id: 'uuid',
  userName: 'updatedUser',
  address: 'updatedAddress',
  email: 'updatedEmail@gmail.com',
};

export const mockUser: User = {
  id: 'uuid',
  userName: 'johndoe',
  address: 'someethaddress',
  email: 'johndoe@gmail.com',
  profile: {
    id: 'uuid',
    firstName: 'John',
    lastName: 'Doe',
    location: 'location',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockCreateUser = {
  address: 'ethaddress',
  userName: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'johndoe@gmail.com',
};

export const mockSignupRequest: SignUpDTO = {
  message: 'mockMessage', // Added this
  signature: 'mockSignature', // Added this
  address: '0x1234567890AbcdEF1234567890aBcdef12345678',
  userName: 'testuser',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
};
