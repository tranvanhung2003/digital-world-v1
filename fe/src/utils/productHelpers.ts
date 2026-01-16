/**
 * Các hàm tiện ích cho việc quản lý biến thể sản phẩm và tồn kho
 */

import {
  Product,
  ProductVariant,
  ProductAttribute,
} from '@/types/product.types';

/**
 * Lấy tồn kho của các biến thể dựa trên các thuộc tính đã chọn
 */
export const getVariantStock = (
  product: Product,
  selectedAttributes: Record<string, string>,
): number => {
  // Nếu sản phẩm không có biến thể, trả về tồn kho của sản phẩm
  if (!product.variants || product.variants.length === 0) {
    return product.stock || 0;
  }

  // Nếu không có thuộc tính nào được chọn, trả về tổng tồn kho của sản phẩm
  if (Object.keys(selectedAttributes).length === 0) {
    return product.stock || 0;
  }

  // Tìm các biến thể khớp với các thuộc tính đã chọn
  const matchingVariants = product.variants.filter((variant) => {
    // Nếu biến thể không có thuộc tính, bỏ qua
    if (!variant.attributes) return false;

    // Trả về true nếu tất cả các thuộc tính đã chọn khớp với biến thể
    return Object.entries(selectedAttributes).every(
      ([key, value]) => variant.attributes[key] === value,
    );
  });

  // Nếu chỉ có một biến thể khớp, trả về tồn kho của nó
  if (matchingVariants.length === 1) {
    return matchingVariants[0].stockQuantity;
  }

  // Nếu có nhiều biến thể khớp (chỉ chọn một phần thuộc tính), trả về tổng tồn kho của chúng
  if (matchingVariants.length > 1) {
    return matchingVariants.reduce(
      (total, variant) => total + variant.stockQuantity,
      0,
    );
  }

  // Nếu không có biến thể nào khớp, trả về 0
  return 0;
};

/**
 * Tìm biến thể dựa trên các thuộc tính đã chọn
 */
export const findVariantByAttributes = (
  variants: ProductVariant[],
  selectedAttributes: Record<string, string>,
): ProductVariant | null => {
  // Nếu không có biến thể nào, trả về null
  if (!variants || variants.length === 0) return null;

  return (
    // Tìm các biến thể khớp với các thuộc tính đã chọn
    variants.find((variant) => {
      // Nếu biến thể không có thuộc tính, bỏ qua
      if (!variant.attributes) return false;

      // Trả về true nếu tất cả các thuộc tính đã chọn khớp với biến thể
      return Object.entries(selectedAttributes).every(
        ([key, value]) => variant.attributes[key] === value,
      );
    }) || null // Nếu không tìm thấy, trả về null
  );
};

/**
 * Lấy tồn kho cho một giá trị thuộc tính cụ thể
 */
export const getAttributeValueStock = (
  product: Product,
  attributeName: string,
  attributeValue: string,
): number => {
  // Nếu sản phẩm không có biến thể, trả về tồn kho của sản phẩm
  if (!product.variants || product.variants.length === 0) {
    return product.stock || 0;
  }

  // Tìm các biến thể khớp với giá trị thuộc tính cụ thể
  const matchingVariants = product.variants.filter((variant) => {
    return (
      variant.attributes && variant.attributes[attributeName] === attributeValue
    );
  });

  // Tính tổng tồn kho của các biến thể khớp
  return matchingVariants.reduce(
    (total, variant) => total + variant.stockQuantity,
    0,
  );
};

/**
 * Kiểm tra xem sản phẩm có biến thể hay không
 */
export const hasVariants = (product: Product): boolean => {
  return !!(product.variants && product.variants.length > 0);
};

/**
 * Lấy tất cả các kết hợp thuộc tính có sẵn
 */
export const getAvailableAttributeCombinations = (
  product: Product,
): Record<string, string>[] => {
  // Nếu sản phẩm không có biến thể, trả về mảng rỗng
  if (!product.variants || product.variants.length === 0) return [];

  // Lấy tất cả các kết hợp thuộc tính có tồn kho lớn hơn 0
  return product.variants
    .filter((variant) => variant.stockQuantity > 0)
    .map((variant) => variant.attributes);
};

/**
 * Kiểm tra xem một kết hợp thuộc tính cụ thể có còn hàng hay không
 */
export const isAttributeCombinationAvailable = (
  product: Product,
  selectedAttributes: Record<string, string>,
): boolean => {
  // Nếu sản phẩm không có biến thể, kiểm tra tồn kho của sản phẩm xem có còn hàng không
  if (!product.variants || product.variants.length === 0) {
    return product.stock > 0;
  }

  // Lấy tồn kho cho kết hợp thuộc tính đã chọn
  const stock = getVariantStock(product, selectedAttributes);

  // Trả về true nếu còn hàng
  return stock > 0;
};

/**
 * Lấy giá của biến thể khớp với các thuộc tính đã chọn
 */
export const getVariantPrice = (
  product: Product,
  selectedAttributes: Record<string, string>,
): number => {
  // Nếu sản phẩm không có biến thể, trả về giá của sản phẩm
  if (!product.variants || product.variants.length === 0) {
    return product.price;
  }

  // Tìm biến thể khớp với các thuộc tính đã chọn
  const variant = findVariantByAttributes(product.variants, selectedAttributes);

  // Trả về giá của biến thể nếu tìm thấy, ngược lại trả về giá của sản phẩm
  return variant ? variant.price : product.price;
};

/**
 * Kiểm tra xem tất cả các thuộc tính bắt buộc đã được chọn chưa
 */
export const areAllAttributesSelected = (
  attributes: ProductAttribute[],
  selectedAttributes: Record<string, string>,
): boolean => {
  // Nếu không có thuộc tính nào, trả về true
  if (!attributes || attributes.length === 0) return true;

  // Kiểm tra xem đã chọn tất cả các thuộc tính cần thiết chưa
  return attributes.every((attr) => selectedAttributes[attr.name]);
};

/**
 * Lấy các giá trị thuộc tính kèm theo thông tin tồn kho dựa trên các thuộc tính đã chọn
 */
export const getAttributeValuesWithStock = (
  product: Product,
  attributeName: string,
  selectedAttributes: Record<string, string> = {},
): Array<{ value: string; stock: number; available: boolean }> => {
  // Lấy các giá trị thuộc tính dựa trên tên thuộc tính này
  const attribute = product.attributes?.find(
    (attr) => attr.name === attributeName,
  );

  // Nếu không tìm thấy thuộc tính, trả về mảng rỗng
  if (!attribute) return [];

  return attribute.values.map((attributeValue) => {
    // Tạo kết hợp tạm thời từ các thuộc tính đã chọn và giá trị hiện tại của tên thuộc tính này
    const tempAttributes = {
      ...selectedAttributes,
      [attributeName]: attributeValue,
    };

    // Lấy tồn kho cho kết hợp cụ thể này
    const stock = getVariantStock(product, tempAttributes);

    return {
      value: attributeValue,
      stock,
      available: stock > 0,
    };
  });
};

/**
 * Lấy tồn kho có sẵn cho một giá trị thuộc tính cụ thể dựa trên các thuộc tính đã chọn khác
 */
export const getAttributeValueStockWithContext = (
  product: Product,
  attributeName: string,
  attributeValue: string,
  otherSelectedAttributes: Record<string, string> = {},
): number => {
  // Nếu sản phẩm không có biến thể, trả về tồn kho của sản phẩm
  if (!product.variants || product.variants.length === 0) {
    return product.stock || 0;
  }

  // Tạo kết hợp các thuộc tính đã chọn khác với giá trị cụ thể này
  const combinedAttributes = {
    ...otherSelectedAttributes,
    [attributeName]: attributeValue,
  };

  // Tìm các biến thể khớp với kết hợp thuộc tính này
  const matchingVariants = product.variants.filter((variant) => {
    // Nếu biến thể không có thuộc tính, bỏ qua
    if (!variant.attributes) return false;

    // Trả về true nếu tất cả các thuộc tính trong kết hợp khớp với biến thể
    return Object.entries(combinedAttributes).every(
      ([key, value]) => variant.attributes[key] === value,
    );
  });

  return matchingVariants.reduce(
    (total, variant) => total + variant.stockQuantity,
    0,
  );
};

/**
 * Format văn bản hiển thị tồn kho
 */
export const formatStockText = (stock: number): string => {
  if (stock === 0) return 'Hết hàng';
  if (stock < 10) return `Chỉ còn ${stock} sản phẩm`;
  return `Còn ${stock} sản phẩm`;
};

/**
 * Lấy màu trạng thái tồn kho dựa trên số lượng tồn kho
 * Nếu hết hàng: đỏ, nếu sắp hết hàng: cam, nếu còn nhiều: xanh lá
 */
export const getStockStatusColor = (stock: number): string => {
  if (stock === 0) return 'text-red-500';
  if (stock < 10) return 'text-orange-500';
  return 'text-green-500';
};
