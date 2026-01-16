import React from 'react';
import { Form, Input, Row, Col, Alert } from 'antd';

const { TextArea } = Input;

const ProductImagesForm: React.FC = () => {
  return (
    <Row gutter={[24, 16]}>
      <Col span={24}>
        <Form.Item name="images" label="Hình ảnh sản phẩm">
          <TextArea
            rows={6}
            placeholder={`Nhập URL hình ảnh, mỗi URL trên một dòng. Ví dụ:
https://example.com/image1.jpg
https://example.com/image2.jpg
http://localhost:8888/uploads/images/product/2025/07/sample.jpeg`}
            showCount
            maxLength={3000}
          />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item name="thumbnail" label="Ảnh đại diện">
          <Input placeholder="Nhập URL ảnh đại diện" />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default ProductImagesForm;
