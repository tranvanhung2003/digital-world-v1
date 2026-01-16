import apiClient from './apiClient';

export interface NamePreviewRequest {
  baseName: string;
  selectedAttributes: string[];
  separator?: string;
  includeDetails?: boolean;
}

export interface NameGenerationRequest {
  baseName: string;
  attributeValues: Record<string, string>;
  productId?: string;
  separator?: string;
  includeDetails?: boolean;
}

export interface NamePreviewResponse {
  originalName: string;
  generatedName: string;
  hasChanges: boolean;
  parts: string[];
  affectingAttributes: Array<{
    id: string;
    name: string;
    nameTemplate: string;
    groupName: string;
    groupType: string;
  }>;
  suggestions: string[];
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface AttributeGroup {
  id: string;
  name: string;
  type: string;
  description?: string;
  isRequired?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AttributeValue {
  id: string;
  attributeGroupId: string;
  name: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
  priceAdjustment?: number;
  sortOrder?: number;
  isActive?: boolean;
  affectsName?: boolean;
  nameTemplate?: string;
  attributeGroup?: AttributeGroup;
}

class AttributeService {
  // Xem trước tên sản phẩm với các thuộc tính đã chọn
  async previewProductName(
    request: NamePreviewRequest,
  ): Promise<ApiResponse<NamePreviewResponse>> {
    const response = await apiClient.post('/attributes/preview-name', request);
    return response.data;
  }

  // Tạo tên sản phẩm theo thời gian thực dựa trên tên cơ bản và các thuộc tính đã chọn
  async generateNameRealTime(
    request: NameGenerationRequest,
  ): Promise<ApiResponse<NamePreviewResponse>> {
    const response = await apiClient.post(
      '/attributes/generate-name-realtime',
      request,
    );
    return response.data;
  }

  // Lấy danh sách các thuộc tính có ảnh hưởng đến tên sản phẩm
  async getNameAffectingAttributes(
    productId?: string,
  ): Promise<ApiResponse<AttributeValue[]>> {
    const params = productId ? { productId } : {};
    const response = await apiClient.get('/attributes/name-affecting', {
      params,
    });
    return response.data;
  }

  // Tạo tên sản phẩm hàng loạt dựa trên các mục đã cung cấp
  async batchGenerateNames(
    items: Array<{
      id: string;
      baseName: string;
      selectedAttributes: string[];
    }>,
    separator?: string,
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        baseName: string;
        generatedName: string;
        selectedAttributes: string[];
      }>
    >
  > {
    const response = await apiClient.post('/attributes/batch-generate-names', {
      items,
      separator: separator || ' ',
    });
    return response.data;
  }

  // Lấy tất cả các nhóm thuộc tính cùng với các giá trị của chúng
  async getAttributeGroups(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get('/attributes/groups');
    return response.data;
  }

  // Lấy các nhóm thuộc tính của một sản phẩm cụ thể
  async getProductAttributeGroups(
    productId: string,
  ): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(
      `/attributes/products/${productId}/groups`,
    );
    return response.data;
  }

  // Tạo nhóm thuộc tính mới
  async createAttributeGroup(data: {
    name: string;
    type: string;
    description?: string;
    isRequired?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/attributes/groups', data);
    return response.data;
  }

  // Thêm giá trị thuộc tính vào nhóm thuộc tính
  async addAttributeValue(
    attributeGroupId: string,
    data: {
      name: string;
      value: string;
      colorCode?: string;
      imageUrl?: string;
      priceAdjustment?: number;
      sortOrder?: number;
      affectsName?: boolean;
      nameTemplate?: string;
    },
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post(
      `/attributes/groups/${attributeGroupId}/values`,
      data,
    );
    return response.data;
  }

  // Cập nhật giá trị thuộc tính
  async updateAttributeValue(
    id: string,
    data: {
      name?: string;
      value?: string;
      colorCode?: string;
      imageUrl?: string;
      priceAdjustment?: number;
      sortOrder?: number;
      isActive?: boolean;
      affectsName?: boolean;
      nameTemplate?: string;
    },
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/attributes/values/${id}`, data);
    return response.data;
  }

  // Cập nhật nhóm thuộc tính
  async updateAttributeGroup(
    id: string,
    data: {
      name?: string;
      description?: string;
      type?: string;
      isRequired?: boolean;
      sortOrder?: number;
      isActive?: boolean;
    },
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/attributes/groups/${id}`, data);
    return response.data;
  }

  // Xóa nhóm thuộc tính (chuyển trạng thái isActive thành false)
  async deleteAttributeGroup(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete(`/attributes/groups/${id}`);
    return response.data;
  }

  // Xóa giá trị thuộc tính (chuyển trạng thái isActive thành false)
  async deleteAttributeValue(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete(`/attributes/values/${id}`);
    return response.data;
  }

  // Gán nhóm thuộc tính cho sản phẩm
  async assignAttributeGroupToProduct(
    productId: string,
    attributeGroupId: string,
    data: {
      isRequired?: boolean;
      sortOrder?: number;
    },
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post(
      `/attributes/products/${productId}/groups/${attributeGroupId}`,
      data,
    );
    return response.data;
  }
}

export const attributeService = new AttributeService();
export default attributeService;
