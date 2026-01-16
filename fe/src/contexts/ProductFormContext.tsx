import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type ProductFormData = Record<string, any>;

export interface ProductFormContextValue {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  resetFormData: (nextData?: ProductFormData) => void;
}

const ProductFormContext = createContext<ProductFormContextValue | undefined>(
  undefined,
);

interface ProductFormProviderProps {
  initialData?: ProductFormData;
  children: React.ReactNode;
}

export const ProductFormProvider: React.FC<ProductFormProviderProps> = ({
  initialData = {},
  children,
}) => {
  const initialRef = useRef<ProductFormData>(initialData);
  const [formData, setFormData] = useState<ProductFormData>(initialData);

  const value = useMemo<ProductFormContextValue>(
    () => ({
      formData,

      // Cập nhật dữ liệu biểu mẫu với các cập nhật từng phần
      updateFormData: (updates) => {
        setFormData((prev) => ({
          ...prev,
          ...updates,
        }));
      },

      // Đặt lại dữ liệu biểu mẫu về trạng thái ban đầu hoặc dữ liệu mới được cung cấp
      resetFormData: (nextData) => {
        // Sử dụng dữ liệu mới nếu được cung cấp, nếu không sử dụng dữ liệu ban đầu
        const data = nextData ?? initialRef.current;

        // Cập nhật tham chiếu ban đầu nếu dữ liệu mới được cung cấp
        // Điều này cho phép đặt lại về dữ liệu mới trong các lần gọi sau
        initialRef.current = data;

        setFormData(data);
      },
    }),
    [formData],
  );

  return (
    <ProductFormContext.Provider value={value}>
      {children}
    </ProductFormContext.Provider>
  );
};

export const useProductFormContext = (): ProductFormContextValue => {
  const context = useContext(ProductFormContext);

  if (!context) {
    throw new Error(
      'useProductFormContext phải được sử dụng bên trong một ProductFormProvider',
    );
  }

  return context;
};

export default ProductFormContext;
