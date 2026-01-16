import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Hàm hỗ trợ kết hợp các className với nhau,
 * sử dụng clsx để xử lý các giá trị className
 * và twMerge để hợp nhất các className của Tailwind CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
