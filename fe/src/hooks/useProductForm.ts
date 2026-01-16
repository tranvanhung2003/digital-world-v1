import { useState, useEffect, useRef } from 'react';
import { Form, FormInstance, message } from 'antd';
import { ProductFormData } from '@/types/product';

interface UseProductFormProps {
  form: FormInstance;
  initialValues?: Partial<ProductFormData>;
  onSubmit: (values: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  onStepComplete?: (step: string, isComplete: boolean) => void;
  attributes?: any[];
  variants?: any[];
  isEditMode?: boolean; // Prop để phân biệt giữa Create và Edit
}

export const useProductForm = ({
  form,
  initialValues,
  onSubmit,
  isSubmitting,
  onStepComplete,
  attributes = [],
  variants = [],
  isEditMode = false,
}: UseProductFormProps) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Hàm validation độc lập
  const performValidation = () => {
    const values = form.getFieldsValue();
    const errors = form.getFieldsError();

    // Validate và cập nhật completion cho từng step
    const validateStep = (step: string) => {
      let isStepValid = false;

      switch (step) {
        case 'basic':
          const basicRequiredFields = [
            'name',
            'shortDescription',
            'description',
          ];

          isStepValid = basicRequiredFields.every((field) => {
            const value = values[field];

            const isValid =
              value !== undefined &&
              value !== null &&
              value !== '' &&
              (typeof value === 'string' ? value.trim() !== '' : true);

            return isValid;
          });
          break;

        case 'specifications':
          // Specifications không bắt buộc, luôn valid
          isStepValid = true;
          break;

        case 'attributes':
          // Attributes không bắt buộc, luôn valid
          isStepValid = true;
          break;

        case 'variants':
          // Variants không bắt buộc, luôn valid
          isStepValid = true;
          break;

        case 'pricing':
          // Nếu có variants, stockQuantity có thể = 0 (vì variants sẽ có stock riêng)
          // Nếu không có variants, cần kiểm tra cả price và stockQuantity
          const hasVariants = variants.length > 0;

          if (hasVariants) {
            // Nếu có variants, chỉ cần stockQuantity được định nghĩa (có thể = 0)
            const stockValue = values['stockQuantity'];

            isStepValid =
              stockValue !== undefined &&
              stockValue !== null &&
              stockValue !== '';
          } else {
            // Nếu không có variants, cần price > 0 và stockQuantity >= 0
            const priceValue = values['price'];
            const stockValue = values['stockQuantity'];

            const priceValid =
              priceValue !== undefined &&
              priceValue !== null &&
              priceValue !== '' &&
              parseFloat(priceValue.toString()) > 0;

            const stockValid =
              stockValue !== undefined &&
              stockValue !== null &&
              stockValue !== '' &&
              parseInt(stockValue.toString()) >= 0;

            isStepValid = priceValid && stockValid;
          }

          break;

        case 'category':
          const categoryValue = values['categoryIds'];

          isStepValid =
            categoryValue &&
            Array.isArray(categoryValue) &&
            categoryValue.length > 0;
          break;

        case 'images':
          // Images không bắt buộc
          isStepValid = true;
          break;

        case 'warranty':
          // Warranty không bắt buộc
          isStepValid = true;
          break;

        case 'faqs':
          // FAQs không bắt buộc
          isStepValid = true;
          break;

        case 'seo':
          // SEO không bắt buộc
          isStepValid = true;
          break;
        default:
          isStepValid = false;
      }

      // Cập nhật completion status cho step
      if (onStepComplete) {
        onStepComplete(step, isStepValid);
      }

      return isStepValid;
    };

    // Validate tất cả các steps
    const allSteps = [
      'basic',
      'specifications',
      'attributes',
      'variants',
      'pricing',
      'category',
      'images',
      'warranty',
      'seo',
    ];
    allSteps.forEach((step) => validateStep(step));

    // Validate step hiện tại
    const currentStepValid = validateStep(activeTab);

    // Kiểm tra xem có lỗi validation nào không
    const hasErrors = errors.some(
      (error) => error.errors && error.errors.length > 0,
    );

    // Form chỉ valid khi không có lỗi
    const isValid = !hasErrors;
    setIsFormValid(isValid);

    // Trả về trạng thái của step hiện tại
    return currentStepValid;
  };

  // Theo dõi sự thay đổi của activeTab, attributes, variants
  useEffect(() => {
    // Khi tab thay đổi, kiểm tra tính hợp lệ của form
    performValidation();
  }, [activeTab, attributes, variants]);

  // Set initial values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // Theo dõi toàn bộ giá trị form để cập nhật validation
  const watchFormValues = Form.useWatch([], form);

  // Sử dụng useRef để tránh vòng lặp vô hạn
  const isFirstRender = useRef(true);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Bỏ qua bước xác thực khi render lần đầu để tránh xác thực không cần thiết
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    // Xóa timeout trước đó để tránh nhiều lần validation liên tục
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    const validateFormValues = () => {
      const values = form.getFieldsValue();
      const errors = form.getFieldsError();

      // Kiểm tra các trường bắt buộc
      const requiredFields = [
        'name',
        'shortDescription',
        'description',
        'price',
        'stockQuantity',
        'categoryIds',
      ];

      const isFieldsFilled = requiredFields.every((field) => {
        const value = values[field];

        if (field === 'categoryIds') {
          return value && Array.isArray(value) && value.length > 0;
        }

        if (field === 'price' || field === 'stockQuantity') {
          return (
            value !== undefined && value !== null && value !== '' && value >= 0
          );
        }
        return (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          (typeof value === 'string' ? value.trim() !== '' : true)
        );
      });

      // Kiểm tra có lỗi validation nào không
      const hasErrors = errors.some(
        (error) => error.errors && error.errors.length > 0,
      );

      // Set trạng thái form hợp lệ nếu các trường bắt buộc đã điền và không có lỗi
      const isValid = isFieldsFilled && !hasErrors;
      setIsFormValid(isValid);
    };

    // Sử dụng setTimeout để tránh quá nhiều validation liên tục
    validationTimeoutRef.current = setTimeout(() => {
      validateFormValues();
    }, 100);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [watchFormValues, form]);

  /**
   * Hàm xác thực form - có thể được sử dụng để xác thực thủ công
   */
  const validateForm = () => {
    return performValidation();
  };

  // Lấy danh sách các trường bắt buộc mà người dùng chưa điền
  const getMissingFields = () => {
    const values = form.getFieldsValue();

    const fieldLabels = {
      name: 'Tên sản phẩm',
      shortDescription: 'Mô tả ngắn',
      description: 'Mô tả chi tiết',
      price: 'Giá bán',
      stockQuantity: 'Số lượng tồn kho',
      categoryIds: 'Danh mục',
      attributes: 'Thuộc tính sản phẩm',
      variants: 'Biến thể sản phẩm',
    };

    // Kiểm tra các trường form cơ bản
    const requiredFields = [
      'name',
      'shortDescription',
      'description',
      'price',
      'stockQuantity',
      'categoryIds',
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = values[field];

      if (field === 'categoryIds') {
        const isValid = value && Array.isArray(value) && value.length > 0;

        return !isValid;
      }

      if (field === 'price') {
        // Nếu có variants, price có thể = 0 hoặc undefined
        const hasVariants = variants.length > 0;

        if (hasVariants) {
          return false;
        }

        const isValid =
          value !== undefined &&
          value !== null &&
          value !== '' &&
          parseFloat(value.toString()) > 0;

        return !isValid;
      }

      if (field === 'stockQuantity') {
        const isValid =
          value !== undefined &&
          value !== null &&
          value !== '' &&
          parseInt(value.toString()) >= 0;

        return !isValid;
      }

      // Các trường còn lại
      const isValid =
        value !== undefined &&
        value !== null &&
        value !== '' &&
        (typeof value === 'string' ? value.trim() !== '' : true);

      return !isValid;
    });

    return missingFields.map(
      (field) => fieldLabels[field as keyof typeof fieldLabels],
    );
  };

  // Điền dữ liệu mẫu
  const fillExampleData = () => {
    form.setFieldsValue({
      name: 'iPhone 15 Pro Max',
      description:
        'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP và màn hình Super Retina XDR 6.7 inch sắc nét.',
      shortDescription: 'Flagship mới nhất từ Apple với hiệu năng vượt trội',
      price: 29990000,
      compareAtPrice: 32990000,
      stockQuantity: 100,
      status: 'active',
      featured: true,
      categoryIds: [],
      seoTitle: 'iPhone 15 Pro Max 256GB - Chính hãng Apple',
      seoDescription:
        'Mua iPhone 15 Pro Max chính hãng với giá tốt nhất. Bảo hành 12 tháng.',
      seoKeywords: 'iphone 15 pro max, apple, smartphone, điện thoại',
    });

    // Trigger validation sau khi điền dữ liệu mẫu
    setTimeout(() => {
      performValidation();
    }, 100);
  };

  // Xử lý submit form
  const handleSubmit = async (values: ProductFormData) => {
    // Nếu đang ở chế độ chỉnh sửa (EditProductPage), cho phép submit mà không cần kiểm tra đầy đủ
    if (isEditMode) {
      try {
        await onSubmit(values);
      } catch (error: any) {
        message.error('Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.');
      }

      return;
    }

    // Nếu đang ở chế độ tạo mới (CreateProductPage), kiểm tra các trường bắt buộc
    const missingFieldNames = getMissingFields();

    if (missingFieldNames.length > 0) {
      // Hiển thị thông báo về các trường còn thiếu
      message.error(
        `Vui lòng điền đầy đủ thông tin: ${missingFieldNames.join(', ')}`,
      );
      return;
    }

    try {
      await onSubmit(values);
    } catch (error: any) {
      message.error('Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.');
    }
  };

  return {
    isFormValid,
    setIsFormValid,
    activeTab,
    setActiveTab,
    validateForm,
    getMissingFields,
    fillExampleData,
    handleSubmit,
    isSubmitting,
  };
};
