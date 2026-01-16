/**
 * Các hàm tiện ích transform dữ liệu sản phẩm từ backend sang frontend và ngược lại
 * Tập trung logic transform dữ liệu sản phẩm để tránh trùng lặp code
 */

export interface RawProduct {
  id: string;
  name: string;
  price: string | number;
  compareAtPrice?: string | number;
  stockQuantity: number;
  categories?: Array<{ id: string; name: string }>;
  featured?: boolean;
  ratings?: {
    average: number;
    count: number;
  };
  [key: string]: any;
}

export interface TransformedProduct {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  categoryId: string;
  categoryName: string;
  isFeatured: boolean;
  ratings: {
    average: number;
    count: number;
  };
  [key: string]: any;
}

/**
 * Transform một sản phẩm từ định dạng backend sang định dạng frontend
 */
export const transformProduct = (product: RawProduct): TransformedProduct => {
  return {
    ...product,
    price: parseFloat(String(product.price)),
    compareAtPrice: product.compareAtPrice
      ? parseFloat(String(product.compareAtPrice))
      : null,
    stock: product.stockQuantity,
    categoryId: product.categories?.[0]?.id || '',
    categoryName: product.categories?.[0]?.name || '',
    isFeatured: product.featured || false,
    ratings: product.ratings || {
      average: 0,
      count: 0,
    },
    // Đảm bảo variants và attributes được giữ nguyên
    variants: product.variants || [],
    attributes: product.attributes || [],
  };
};

/**
 * Transform một mảng sản phẩm
 */
export const transformProducts = (
  products: RawProduct[],
): TransformedProduct[] => {
  return products.map(transformProduct);
};

/**
 * Transform response từ API sản phẩm, có thể là một sản phẩm đơn lẻ hoặc mảng sản phẩm
 */
export const transformProductsResponse = (response: any): any => {
  // Nếu response không có data (dữ liệu sản phẩm) thì trả về nguyên bản
  if (!response?.data) return response;

  // Xử lý trường hợp mảng sản phẩm nằm trực tiếp trong response.data
  if (Array.isArray(response.data)) {
    return {
      ...response,
      data: transformProducts(response.data),
    };
  }

  // Xử lý trường hợp mảng sản phẩm nằm trong response.data.products (khi có phân trang)
  if (response.data.products && Array.isArray(response.data.products)) {
    return {
      ...response,
      data: {
        ...response.data,
        products: transformProducts(response.data.products),
      },
    };
  }

  // Xử lý trường hợp response là một sản phẩm đơn lẻ
  if (response.data.id) {
    return {
      ...response,
      data: transformProduct(response.data),
    };
  }

  return response;
};

/**
 * Tạo URLSearchParams từ bộ lọc sản phẩm
 */
export const createProductFiltersParams = (
  filters: any = {},
): URLSearchParams => {
  const params = new URLSearchParams();

  // Các bộ lọc cơ bản
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.categoryId) params.append('category', filters.categoryId);
  if (filters.search) params.append('search', filters.search);
  if (filters.minPrice !== undefined)
    params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined)
    params.append('maxPrice', filters.maxPrice.toString());

  // Mặc định chỉ lấy sản phẩm active (không inactive)
  if (filters.status !== undefined) {
    params.append('status', filters.status);
  } else {
    params.append('status', 'active');
  }

  // Bộ lọc thương hiệu , màu sắc, kích thước (nếu có)
  const arrayFilters = ['brand', 'color', 'size'];
  arrayFilters.forEach((filter) => {
    if (filters[filter] && Array.isArray(filters[filter])) {
      filters[filter].forEach((value: string) => {
        params.append(filter, value);
      });
    }
  });

  // Bộ lọc thuộc tính động (nếu có)
  Object.keys(filters).forEach((key) => {
    if (key.startsWith('attr_') && Array.isArray(filters[key])) {
      filters[key].forEach((value: string) => {
        params.append(key, value);
      });
    }
  });

  // Sắp xếp
  if (filters.sort) {
    const sortMap: Record<string, string> = {
      price_asc: 'price',
      price_desc: 'price',
      newest: 'createdAt',
      popular: 'rating',
    };

    const orderMap: Record<string, string> = {
      price_desc: 'DESC',
      newest: 'DESC',
      popular: 'DESC',
    };

    params.append('sort', sortMap[filters.sort] || 'createdAt');
    params.append('order', orderMap[filters.sort] || 'ASC');
  }

  return params;
};

/**
 * Tạo product tags từ response của API sản phẩm để sử dụng trong RTK Query caching
 * RTK Query sử dụng tags để xác định khi nào cần làm mới cache, dựa trên các thay đổi dữ liệu
 * Điều này giúp tối ưu hiệu suất và đảm bảo dữ liệu luôn mới nhất,
 * đặc biệt khi có các thao tác thêm, sửa, xóa sản phẩm
 */
export const generateProductTags = (
  result: any,
  tagType: string = 'LIST',
): Array<{ type: 'Product'; id: string | number }> => {
  // Nếu không có dữ liệu trả về, trả về tag LIST chung
  if (!result?.data) return [{ type: 'Product', id: tagType }];

  // Xử lý trường hợp mảng sản phẩm nằm trực tiếp trong result.data
  // Trả về một mảng các tag sản phẩm cộng với tag cho toàn bộ danh sách
  if (Array.isArray(result.data)) {
    return [
      ...result.data.map(({ id }: any) => ({
        type: 'Product' as const,
        id,
      })),
      { type: 'Product', id: tagType },
    ];
  }

  // Xử lý trường hợp mảng sản phẩm nằm trong result.data.products (khi có phân trang)
  // Trả về một mảng các tag sản phẩm cộng với tag cho toàn bộ danh sách
  if (result.data.products && Array.isArray(result.data.products)) {
    return [
      ...result.data.products.map(({ id }: any) => ({
        type: 'Product' as const,
        id,
      })),
      { type: 'Product', id: tagType },
    ];
  }

  // Xử lý trường hợp result là một sản phẩm đơn lẻ
  // Trả về tag cho sản phẩm đó
  if (result.data.id) {
    return [{ type: 'Product', id: result.data.id }];
  }

  return [{ type: 'Product', id: tagType }];
};
