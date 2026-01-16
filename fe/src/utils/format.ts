/**
 * Format giá theo định dạng tiền Việt Nam
 * @param price - Giá cần định dạng (có thể là chuỗi hoặc số)
 * @returns Chuỗi giá đã định dạng
 */
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Xử lý giá không hợp lệ
  if (isNaN(numPrice)) {
    return '0đ';
  }

  return `${numPrice.toLocaleString('vi-VN')}đ`;
};

/**
 * Format giá theo định dạng tiền Đô la Mỹ
 * @param price - Giá cần định dạng (có thể là chuỗi hoặc số)
 * @returns Chuỗi giá đã định dạng
 */
export const formatPriceUSD = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Xử lý giá không hợp lệ
  if (isNaN(numPrice)) {
    return '$0.00';
  }

  return `$${numPrice.toFixed(2)}`;
};

/**
 * Format số theo định dạng tiếng Việt
 * @param num - Số cần định dạng
 * @returns Chuỗi số đã định dạng
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

/**
 * Parse price from string to number
 * Parse giá từ chuỗi sang số
 * @param price - Chuỗi giá cần parse
 * @returns Số đã phân tích hoặc 0 nếu không hợp lệ
 */
export const parsePrice = (price: string | number): number => {
  // Nếu đã là số thì trả về trực tiếp
  if (typeof price === 'number') {
    return price;
  }

  // Nếu là chuỗi thì parse sang số
  const parsed = parseFloat(price);

  // Trả về 0 nếu không phải số hợp lệ, ngược lại trả về số đã parse
  return isNaN(parsed) ? 0 : parsed;
};
