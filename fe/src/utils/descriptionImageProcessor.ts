import { message } from 'antd';

export interface ProcessDescriptionOptions {
  productId?: string;
  category?: 'product' | 'user' | 'review';
  uploadImageFn: (params: {
    base64Data: string;
    options?: {
      category?: string;
      productId?: string;
    };
  }) => Promise<any>;
}

export interface ProcessDescriptionResult {
  processedDescription: string;
  uploadedImages: Array<{
    originalBase64: string;
    uploadedUrl: string;
    imageId: string;
  }>;
  hasChanges: boolean;
}

/**
 * Xử lý nội dung description để convert ảnh base64 thành file đã upload
 * @param description - Nội dung HTML từ trình soạn thảo
 * @param options - Các tùy chọn xử lý
 * @returns Promise với nội dung đã xử lý và kết quả upload
 */
export const processDescriptionImages = async (
  description: string,
  options: ProcessDescriptionOptions,
): Promise<ProcessDescriptionResult> => {
  // Nếu không có description, trả về dữ liệu gốc
  if (!description) {
    return {
      processedDescription: description,
      uploadedImages: [],
      hasChanges: false,
    };
  }

  // Tìm tất cả các URL ảnh base64 trong description
  const base64ImageRegex = /data:image\/[a-zA-Z]*;base64,[A-Za-z0-9+/=]+/g;
  const base64Images = description.match(base64ImageRegex) || [];

  // Nếu không có ảnh base64, trả về dữ liệu gốc
  if (base64Images.length === 0) {
    return {
      processedDescription: description,
      uploadedImages: [],
      hasChanges: false,
    };
  }

  console.log(`Đã tìm thấy ${base64Images.length} ảnh base64 để convert`);

  let processedDescription = description;
  const uploadedImages: ProcessDescriptionResult['uploadedImages'] = [];
  let hasErrors = false;

  // Hiển thị thông báo đang xử lý
  const loadingKey = 'converting-images';
  message.loading({
    content: `Đang convert ${base64Images.length} ảnh base64 thành file...`,
    key: loadingKey,
    duration: 0,
  });

  try {
    // Xử lý từng ảnh base64
    for (let i = 0; i < base64Images.length; i++) {
      const base64Data = base64Images[i];

      try {
        console.log(`Đang convert ảnh ${i + 1}/${base64Images.length}`);

        // Cập nhật thông báo đang xử lý
        message.loading({
          content: `Đang convert ảnh ${i + 1}/${base64Images.length}...`,
          key: loadingKey,
          duration: 0,
        });

        // Gọi API để convert base64 thành file đã upload
        const result = await options.uploadImageFn({
          base64Data,
          options: {
            category: options.category || 'product',
            productId: options.productId,
          },
        });

        // Nếu upload thành công, thay thế URL trong description
        if (result?.data) {
          const uploadedUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8888'}${result.data.url}`;

          // Thay thế base64 bằng URL đã upload trong description
          processedDescription = processedDescription.replace(
            base64Data,
            uploadedUrl,
          );

          uploadedImages.push({
            originalBase64: base64Data,
            uploadedUrl,
            imageId: result.data.id,
          });

          console.log(
            `Đã convert thành công ảnh ${i + 1}: ${result.data.fileName}`,
          );
        } else {
          console.error(
            `Không thể convert ảnh ${i + 1}: Không có dữ liệu trong phản hồi`,
          );

          hasErrors = true;
        }
      } catch (error: any) {
        console.error(`Lỗi khi convert ảnh ${i + 1}:`, error);

        hasErrors = true;

        // Tiếp tục với các ảnh khác ngay cả khi một ảnh bị lỗi
        const errorMessage =
          error?.data?.message || error?.message || 'Lỗi không xác định';
        console.error(`Không thể convert ảnh ${i + 1}: ${errorMessage}`);
      }
    }

    // Ẩn thông báo đang xử lý
    message.destroy(loadingKey);

    // Hiển thị thông báo kết quả
    if (uploadedImages.length > 0) {
      if (hasErrors) {
        // Case có một số ảnh không thể convert
        message.warning(
          `Đã convert ${uploadedImages.length}/${base64Images.length} ảnh thành công. Một số ảnh không thể convert.`,
        );
      } else {
        // Case tất cả ảnh đều convert thành công
        message.success(
          `Đã convert thành công ${uploadedImages.length} ảnh base64 thành file!`,
        );
      }
    } else if (hasErrors) {
      // Case không ảnh nào có thể convert
      message.error('Không thể convert ảnh base64 nào. Vui lòng thử lại.');
    }

    return {
      processedDescription,
      uploadedImages,
      hasChanges: uploadedImages.length > 0,
    };
  } catch (error) {
    // Ẩn thông báo đang xử lý
    message.destroy(loadingKey);

    console.error('Lỗi khi xử lý ảnh trong description:', error);
    message.error('Có lỗi xảy ra khi convert ảnh base64');

    return {
      processedDescription: description, // Trả về description gốc nếu có lỗi
      uploadedImages: [],
      hasChanges: false,
    };
  }
};

/**
 * Kiểm tả xem description có chứa ảnh base64 không
 * @param description - Nội dung HTML để kiểm tra
 * @returns true nếu có ảnh base64, ngược lại false
 */
export const hasBase64Images = (description: string): boolean => {
  if (!description) return false;

  const base64ImageRegex = /data:image\/[a-zA-Z]*;base64,[A-Za-z0-9+/=]+/g;

  return base64ImageRegex.test(description);
};

/**
 * Đếm số lượng ảnh base64 trong description
 * @param description - Nội dung HTML để kiểm tra
 * @returns số lượng ảnh base64 tìm thấy
 */
export const countBase64Images = (description: string): number => {
  if (!description) return 0;

  const base64ImageRegex = /data:image\/[a-zA-Z]*;base64,[A-Za-z0-9+/=]+/g;

  const matches = description.match(base64ImageRegex);

  return matches ? matches.length : 0;
};
