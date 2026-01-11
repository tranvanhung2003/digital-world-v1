const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Order Model.
 *
 * Thuộc tính "status" sử dụng ENUM("pending", "processing", "shipped", "delivered", "cancelled")
 * để giới hạn các trạng thái đơn hàng.
 *
 * Thuộc tính "paymentStatus" sử dụng ENUM("pending", "paid", "failed", "refunded")
 * để theo dõi trạng thái thanh toán của đơn hàng.
 */
const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ma_don_hang',
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'nguoi_dung_id',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ),
      defaultValue: 'pending',
      field: 'trang_thai',
    },
    shippingFirstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_nguoi_nhan',
    },
    shippingLastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ho_nguoi_nhan',
    },
    shippingCompany: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cong_ty_nguoi_nhan',
    },
    shippingAddress1: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'dia_chi_nguoi_nhan_1',
    },
    shippingAddress2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'dia_chi_nguoi_nhan_2',
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'quan_huyen_nguoi_nhan',
    },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'tinh_thanh_nguoi_nhan',
    },
    shippingZip: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ma_buu_dien_nguoi_nhan',
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'quoc_gia_nguoi_nhan',
    },
    shippingPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'so_dien_thoai_nguoi_nhan',
    },
    billingFirstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_nguoi_thanh_toan',
    },
    billingLastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ho_nguoi_thanh_toan',
    },
    billingCompany: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cong_ty_nguoi_thanh_toan',
    },
    billingAddress1: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'dia_chi_nguoi_thanh_toan_1',
    },
    billingAddress2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'dia_chi_nguoi_thanh_toan_2',
    },
    billingCity: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'quan_huyen_nguoi_thanh_toan',
    },
    billingState: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'tinh_thanh_nguoi_thanh_toan',
    },
    billingZip: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ma_buu_dien_nguoi_thanh_toan',
    },
    billingCountry: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'quoc_gia_nguoi_thanh_toan',
    },
    billingPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'so_dien_thoai_nguoi_thanh_toan',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'phuong_thuc_thanh_toan',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      field: 'trang_thai_thanh_toan',
    },
    paymentTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ma_giao_dich_thanh_toan',
    },
    paymentProvider: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nha_cung_cap_thanh_toan',
    },
    subtotal: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      field: 'tong_phu',
    },
    tax: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      field: 'thue',
    },
    shippingCost: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      field: 'phi_van_chuyen',
    },
    discount: {
      type: DataTypes.DECIMAL(19, 2),
      defaultValue: 0,
      field: 'giam_gia',
    },
    total: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      field: 'tong_tien',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'ghi_chu',
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ma_theo_doi',
    },
    shippingProvider: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'nha_cung_cap_van_chuyen',
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ngay_giao_du_kien',
    },
  },
  {
    tableName: 'don_hang',
    timestamps: true,
  },
);

module.exports = Order;
