import * as XLSX from 'xlsx';

/**
 * Export dữ liệu ra file Excel (.xlsx)
 * @param data Mảng các object để xuất
 * @param fileName Tên file (không bao gồm phần mở rộng)
 * @param sheetName Tên của worksheet
 */
export const exportToExcel = (
  data: any[],
  fileName: string,
  sheetName: string = 'Sheet1',
) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Export dữ liệu ra file CSV (.csv)
 *
 * @param data Mảng các object để xuất
 * @param fileName Tên file (không bao gồm phần mở rộng)
 */
export const exportToCSV = (data: any[], fileName: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Thêm dòng tiêu đề
  csvRows.push(headers.join(','));

  // Thêm các dòng dữ liệu
  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');

      return `"${escaped}"`;
    });

    csvRows.push(values.join(','));
  }

  // Tạo nội dung CSV
  const csvContent = csvRows.join('\n');

  // Tạo Blob từ nội dung CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Tạo liên kết tải xuống
  const link = document.createElement('a');

  // Nếu trình duyệt hỗ trợ tính năng tải xuống, thực hiện tải xuống
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
