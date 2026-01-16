import { useState, useEffect } from 'react';

/**
 * Hook này trì hoãn việc cập nhật một giá trị cho đến khi hết thời gian chờ được chỉ định
 * Hữu ích cho các ô nhập liệu tìm kiếm để ngăn chặn quá nhiều cuộc gọi API trong khi gõ
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập một bộ hẹn giờ để cập nhật giá trị đã trì hoãn sau khoảng thời gian chờ được chỉ định
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa bộ hẹn giờ nếu giá trị thay đổi trước khi thời gian chờ kết thúc
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
