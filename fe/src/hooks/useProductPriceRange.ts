import { useMemo } from 'react';
import { calculatePriceRange } from '@/utils/priceUtils';

/**
 * Custom hook để tính toán khoảng giá của sản phẩm dựa trên giá cơ bản và các biến thể
 * Nếu sản phẩm có biến thể, hook sẽ trả về khoảng giá dựa trên các biến thể đó
 * Nếu không có biến thể, hook sẽ trả về giá cơ bản của sản phẩm
 */
export const useProductPriceRange = (basePrice: number, variants?: any[]) => {
  const priceInfo = useMemo(() => {
    if (variants && variants.length > 0) {
      const processedVariants = variants.map((variant: any) => ({
        id: variant.id,
        name: variant.name,
        price: parseFloat(variant.price),
        stockQuantity: variant.stockQuantity,
        attributes: variant.attributes,
      }));

      return {
        ...calculatePriceRange(basePrice, processedVariants as any),
        hasVariants: true,
      };
    }

    return {
      ...calculatePriceRange(basePrice),
      hasVariants: false,
    };
  }, [basePrice, variants]);

  return {
    priceInfo,
    isLoading: false,
    hasVariants: priceInfo.hasVariants,
  };
};
