import { api } from './api';

export interface ImageResponse {
  status: string;
  message: string;
  data: {
    id: string;
    originalName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
    category: 'product' | 'thumbnail' | 'user' | 'review';
    productId?: string;
    userId?: string;
    url: string;
    thumbnails?: Array<{
      size: 'small' | 'medium' | 'large';
      path: string;
      fileName: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MultipleImageResponse {
  status: string;
  message: string;
  data: {
    successful: ImageResponse['data'][];
    failed: Array<{
      fileName: string;
      error: string;
    }>;
    count: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}

export interface ProductImagesResponse {
  status: string;
  data: {
    images: ImageResponse['data'][];
    count: number;
  };
}

export interface UploadImageOptions {
  category?: 'product' | 'user' | 'review';
  productId?: string;
  generateThumbs?: boolean;
  optimize?: boolean;
}

export interface ConvertBase64Options {
  category?: 'product' | 'user' | 'review';
  productId?: string;
}

export const imageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Tải lên một ảnh
    uploadImage: builder.mutation<
      ImageResponse,
      { file: File; options?: UploadImageOptions }
    >({
      query: ({ file, options = {} }) => {
        const formData = new FormData();
        formData.append('image', file);

        // Add options as form data
        if (options.category) formData.append('category', options.category);
        if (options.productId) formData.append('productId', options.productId);
        if (options.generateThumbs !== undefined) {
          formData.append('generateThumbs', String(options.generateThumbs));
        }
        if (options.optimize !== undefined) {
          formData.append('optimize', String(options.optimize));
        }

        return {
          url: '/images/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Images'],
    }),

    // Tải lên nhiều ảnh
    uploadMultipleImages: builder.mutation<
      MultipleImageResponse,
      { files: File[]; options?: UploadImageOptions }
    >({
      query: ({ files, options = {} }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('images', file);
        });

        // Add options as form data
        if (options.category) formData.append('category', options.category);
        if (options.productId) formData.append('productId', options.productId);
        if (options.generateThumbs !== undefined) {
          formData.append('generateThumbs', String(options.generateThumbs));
        }
        if (options.optimize !== undefined) {
          formData.append('optimize', String(options.optimize));
        }

        return {
          url: '/images/upload-multiple',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Images'],
    }),

    // Lấy ảnh theo ID
    getImageById: builder.query<ImageResponse, string>({
      query: (id) => ({
        url: `/images/${id}`,
        method: 'GET',
      }),
      providesTags: ['Images'],
    }),

    // Lấy tất cả ảnh liên quan đến một sản phẩm
    getImagesByProductId: builder.query<ProductImagesResponse, string>({
      query: (productId) => ({
        url: `/images/product/${productId}`,
        method: 'GET',
      }),
      providesTags: ['Images'],
    }),

    // Xóa một ảnh theo ID
    deleteImage: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/images/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Images'],
    }),

    // Chuyển đổi dữ liệu ảnh từ base64 thành file
    convertBase64ToImage: builder.mutation<
      ImageResponse,
      { base64Data: string; options?: ConvertBase64Options }
    >({
      query: ({ base64Data, options = {} }) => ({
        url: '/images/convert/base64',
        method: 'POST',
        body: {
          base64Data,
          category: options.category || 'product',
          productId: options.productId,
        },
      }),
      invalidatesTags: ['Images'],
    }),

    // Health check cho image service
    imageHealthCheck: builder.query<
      { status: string; message: string; data: any },
      void
    >({
      query: () => ({
        url: '/images/health',
        method: 'GET',
      }),
    }),

    // Xóa các file ảnh không liên kết trong hệ thống (orphaned files)
    cleanupOrphanedFiles: builder.mutation<
      {
        status: string;
        message: string;
        data: {
          totalFiles: number;
          activeFiles: number;
          orphanedFiles: number;
          deletedFiles: number;
        };
      },
      void
    >({
      query: () => ({
        url: '/images/admin/cleanup',
        method: 'POST',
      }),
      invalidatesTags: ['Images'],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadMultipleImagesMutation,
  useGetImageByIdQuery,
  useGetImagesByProductIdQuery,
  useDeleteImageMutation,
  useConvertBase64ToImageMutation,
  useImageHealthCheckQuery,
  useCleanupOrphanedFilesMutation,
} = imageApi;
