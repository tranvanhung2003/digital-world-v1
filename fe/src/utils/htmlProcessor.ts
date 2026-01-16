/**
 * Các tiện ích xử lý HTML
 */

/**
 * Hàm xử lý nội dung HTML để hiển thị trong trình soạn thảo
 */
export const processHtmlForEditor = (content: string): string => {
  // Kiểm tra nếu nội dung rỗng hoặc không phải chuỗi, trả về chuỗi rỗng
  if (!content || typeof content !== 'string') return '';

  // Sử dụng một phần tử textarea để giải mã các thực thể HTML
  let processedContent = content;

  const textarea = document.createElement('textarea');
  textarea.innerHTML = processedContent;
  processedContent = textarea.value;

  return processedContent;
};
