import { User } from '@/types/user.types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'Trần Văn Hưng',
    phone: '0368228453',
    avatar: 'https://placehold.co/400x400?text=JD',
    role: 'customer',
    addresses: [
      {
        id: 'addr1',
        name: 'Nhà riêng',
        firstName: 'Hưng',
        lastName: 'Trần Văn',
        address1: 'Phong Thử 2',
        city: 'Điện Bàn',
        state: 'Quảng Nam',
        zip: '550000',
        country: 'VN',
        phone: '0368228453',
        isDefault: true,
      },
      {
        id: 'addr2',
        name: 'Văn phòng',
        firstName: 'Hưng',
        lastName: 'Trần Văn',
        company: 'Công ty TNHH Digital World',
        address1: 'Địa chỉ 1',
        address2: 'Địa chỉ 2',
        city: 'Điện Bàn',
        state: 'Quảng Nam',
        zip: '550000',
        country: 'VN',
        phone: '0368228453',
        isDefault: false,
      },
    ],
    defaultAddressId: 'addr1',
    wishlist: ['1', '4', '6'],
    isEmailVerified: true,
    createdAt: '2023-01-10T08:15:00Z',
    updatedAt: '2023-06-15T14:30:00Z',
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    phone: '555-234-5678',
    avatar: 'https://placehold.co/400x400?text=JS',
    role: 'customer',
    addresses: [
      {
        id: 'addr3',
        name: 'Home',
        firstName: 'Jane',
        lastName: 'Smith',
        address1: '789 Residential Ln',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'US',
        phone: '555-234-5678',
        isDefault: true,
      },
    ],
    defaultAddressId: 'addr3',
    wishlist: ['2', '7'],
    isEmailVerified: true,
    createdAt: '2023-02-15T10:20:00Z',
    updatedAt: '2023-05-20T11:45:00Z',
  },
  {
    id: 'admin1',
    email: 'admin@gmail.com',
    firstName: 'Admin',
    lastName: 'User',
    name: 'Admin User',
    phone: '555-999-8888',
    avatar: 'https://placehold.co/400x400?text=AU',
    role: 'admin',
    isEmailVerified: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-06-01T00:00:00Z',
  },
];

export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find((user) => user.id === userId);
};

export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find((user) => user.email === email);
};

export const authenticateUser = (
  email: string,
  password: string,
): { user: User; token: string } | null => {
  const user = getUserByEmail(email);

  if (user) {
    // Tạo mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    return { user, token };
  }

  return null;
};
