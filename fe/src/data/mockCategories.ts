import { Category } from '@/types/category.types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Âm thanh',
    slug: 'audio',
    description: 'Tai nghe, loa và phụ kiện âm thanh',
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2065&q=80',
    parentId: null,
    level: 0,
    isActive: true,
    productCount: 15,
  },
  {
    id: '2',
    name: 'Thiết Bị Đeo',
    slug: 'wearables',
    description:
      'Đồng hồ thông minh, vòng đeo theo dõi sức khỏe và thiết bị đeo công nghệ',
    image:
      'https://images.unsplash.com/photo-1617625802912-cde586faf331?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    parentId: null,
    level: 0,
    isActive: true,
    productCount: 8,
  },
  {
    id: '3',
    name: 'Máy Tính',
    slug: 'computers',
    description: 'Laptop, máy tính để bàn và phụ kiện máy tính',
    image:
      'https://images.unsplash.com/photo-1640955014216-75201056c829?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    parentId: null,
    level: 0,
    isActive: true,
    productCount: 12,
  },
  {
    id: '4',
    name: 'Phụ Kiện',
    slug: 'accessories',
    description: 'Sạc, ốp lưng và các phụ kiện công nghệ khác',
    image:
      'https://images.unsplash.com/photo-1600003263720-95b45a4035d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    parentId: null,
    level: 0,
    isActive: true,
    productCount: 20,
  },
  {
    id: '5',
    name: 'TV & Rạp Hát Tại Gia',
    slug: 'tvs-home-theater',
    description: 'TV, máy chiếu và hệ thống rạp hát tại gia',
    image:
      'https://images.unsplash.com/photo-1601944179066-29b8f7e29c3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    parentId: null,
    level: 0,
    isActive: true,
    productCount: 10,
  },
  {
    id: '6',
    name: 'Máy Ảnh',
    slug: 'cameras',
    description: 'Máy ảnh kỹ thuật số, ống kính và phụ kiện nhiếp ảnh',
    image:
      'https://images.unsplash.com/photo-1516724562728-afc824a36e84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    parentId: null,
    level: 0,
    isActive: true,
    productCount: 7,
  },
  {
    id: '7',
    name: 'Gaming',
    slug: 'gaming',
    description: 'Máy chơi game, đĩa game và phụ kiện chơi game',
    image:
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    parentId: null,
    level: 0,
    isActive: true,
    productCount: 15,
  },
];

export const getCategories = (): Category[] => {
  return mockCategories;
};

export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find((category) => category.id === id);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return mockCategories.find((category) => category.slug === slug);
};
