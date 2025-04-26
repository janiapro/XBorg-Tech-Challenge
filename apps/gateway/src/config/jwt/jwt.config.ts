import { Algorithm } from 'jsonwebtoken';

export const signOptions = {
  algorithm: 'HS256' as Algorithm, // Explicitly cast to Algorithm
  expiresIn: '1h',
};
