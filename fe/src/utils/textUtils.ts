/**
 * Các hàm tiện ích để xử lý văn bản
 */

/**
 * Xóa các thẻ HTML và trích xuất plain text
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';

  // Tạo một phần tử div tạm thời để parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Xóa các thẻ script và style
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach((el) => el.remove());

  // Lấy nội dung văn bản và làm sạch nó
  const text = tempDiv.textContent || tempDiv.innerText || '';

  // Loại bỏ khoảng trắng thừa và xuống dòng
  return text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
};

/**
 * Trích xuất từ khóa từ văn bản
 */
export const extractKeywords = (
  text: string,
  maxKeywords: number = 10,
): string[] => {
  if (!text) return [];

  // Chuyển văn bản về dạng thường, loại bỏ ký tự đặc biệt
  const cleanText = text
    .toLowerCase()
    .replace(
      /[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();

  // Tách thành các từ
  const words = cleanText.split(' ');

  // Các từ dừng phổ biến trong tiếng Việt và tiếng Anh
  const stopWords = new Set([
    'và',
    'của',
    'có',
    'là',
    'được',
    'cho',
    'với',
    'từ',
    'trong',
    'trên',
    'dưới',
    'về',
    'để',
    'khi',
    'nếu',
    'như',
    'sẽ',
    'đã',
    'đang',
    'các',
    'những',
    'này',
    'đó',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín',
    'mười',
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'up',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'a',
    'an',
  ]);

  // Filter out stop words and short words
  // Lọc bỏ các từ dừng và từ ngắn (< 3 ký tự)
  const filteredWords = words.filter(
    (word) => word.length >= 3 && !stopWords.has(word) && !/^\d+$/.test(word), // Loại bỏ các từ chỉ toàn số
  );

  // Đếm tần suất xuất hiện của từ
  const wordCount = new Map<string, number>();
  filteredWords.forEach((word) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Sắp xếp theo tần suất và lấy các từ phổ biến nhất
  const sortedWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word); // Chỉ lấy từ, bỏ qua tần suất

  return sortedWords;
};

/**
 * Tạo các từ khóa tìm kiếm từ dữ liệu sản phẩm
 */
export const generateSearchKeywords = (
  name: string,
  description: string,
  shortDescription?: string,
  maxKeywords: number = 15,
): string[] => {
  // Kết hợp tất cả văn bản liên quan (tên, mô tả ngắn, mô tả đầy đủ)
  const allText = [
    name || '',
    shortDescription || '',
    stripHtml(description || ''),
  ].join(' ');

  // Trích xuất từ khóa từ văn bản kết hợp
  const keywords = extractKeywords(allText, maxKeywords);

  // Ưu tiên các từ trong tên sản phẩm
  if (name) {
    const nameWords = name
      .toLowerCase()
      .replace(
        /[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g,
        ' ',
      )
      .split(' ')
      .filter((word) => word.length >= 2); // Chỉ lấy từ có độ dài >= 2 ký tự

    // Gộp và loại bỏ trùng lặp
    const allKeywords = [...nameWords, ...keywords];
    const uniqueKeywords = Array.from(new Set(allKeywords));

    return uniqueKeywords.slice(0, maxKeywords);
  }

  return keywords;
};
