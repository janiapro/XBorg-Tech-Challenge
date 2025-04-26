export const mockJwtService = {
  buildAuthRes: jest.fn().mockReturnValue({ token: 'mockToken' }),
};

export const mockUserAPI = {
  getUser: jest.fn().mockResolvedValue({ id: 'mockUserId' }),
  signUp: jest.fn().mockResolvedValue({ id: 'mockUserId' }),
};

export const mockSiweService = {
  verifyMessage: jest.fn().mockResolvedValue({ address: 'mockAddress' }),
};
