// @ts-nocheck
import React from 'react';
import { Form, InputNumber, Switch, Row, Col, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface ProductPricingFormProps {
  hasVariants?: boolean;
}

const ProductPricingForm: React.FC<ProductPricingFormProps> = ({
  hasVariants = false,
}) => {
  return (
    <Row gutter={[24, 16]}>
      {/* Hiển thị trường giá bán */}
      <Col span={12}>
        <Form.Item
          name="price"
          label="Giá bán"
          rules={
            hasVariants
              ? []
              : [{ required: true, message: 'Vui lòng nhập giá bán!' }]
          }
          tooltip={
            hasVariants ? 'Đây là giá mặc định khi không chọn biến thể' : ''
          }
          initialValue={hasVariants ? 0 : undefined}
        >
          <InputNumber
            placeholder="Nhập giá bán"
            style={{ width: '100%' }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            addonAfter="đ"
            min={0}
            disabled={hasVariants}
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="compareAtPrice"
          label="Giá so sánh"
          tooltip="Giá gốc trước khi giảm giá (nếu có)"
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            addonAfter="đ"
            min={0}
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="stockQuantity"
          label={hasVariants ? 'Tổng số lượng tồn kho' : 'Số lượng tồn kho'}
          rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          tooltip={
            hasVariants
              ? 'Đây là tổng số lượng của tất cả biến thể. Hệ thống sẽ tự động cập nhật dựa trên số lượng của các biến thể.'
              : 'Số lượng sản phẩm có sẵn để bán'
          }
          extra={
            hasVariants
              ? 'Số lượng này sẽ được tự động cập nhật dựa trên tổng số lượng của các biến thể'
              : ''
          }
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            disabled={hasVariants}
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="featured"
          label="Sản phẩm nổi bật"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch
            checkedChildren="Có"
            unCheckedChildren="Không"
            defaultChecked={false}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default ProductPricingForm;
