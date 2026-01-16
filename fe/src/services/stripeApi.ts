import { api } from './api';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
}

export interface CreatePaymentIntentResponse {
  status: string;
  data: {
    clientSecret: string;
    paymentIntentId: string;
  };
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface ConfirmPaymentResponse {
  status: string;
  data: {
    paymentIntent: {
      id: string;
      status: string;
      amount: number;
      currency: string;
    };
  };
}

export interface CreateCustomerResponse {
  status: string;
  data: {
    customer: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface GetPaymentMethodsResponse {
  status: string;
  data: {
    paymentMethods: PaymentMethod[];
  };
}

export interface CreateSetupIntentResponse {
  status: string;
  data: {
    clientSecret: string;
    setupIntentId: string;
  };
}

export const stripeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo payment intent Stripe
    createPaymentIntent: builder.mutation<
      CreatePaymentIntentResponse,
      CreatePaymentIntentRequest
    >({
      query: (data) => ({
        url: '/payment/create-payment-intent',
        method: 'POST',
        body: data,
      }),
    }),

    // Xác nhận thanh toán Stripe
    confirmPayment: builder.mutation<
      ConfirmPaymentResponse,
      ConfirmPaymentRequest
    >({
      query: (data) => ({
        url: '/payment/confirm-payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    // Tạo khách hàng Stripe
    createCustomer: builder.mutation<CreateCustomerResponse, void>({
      query: () => ({
        url: '/payment/create-customer',
        method: 'POST',
      }),
    }),

    // Lấy phương thức thanh toán Stripe
    getPaymentMethods: builder.query<GetPaymentMethodsResponse, void>({
      query: () => ({
        url: '/payment/payment-methods',
        method: 'GET',
      }),
      providesTags: [{ type: 'PaymentMethod', id: 'LIST' }],
    }),

    // Tạo setup intent để lưu phương thức thanh toán Stripe
    createSetupIntent: builder.mutation<CreateSetupIntentResponse, void>({
      query: () => ({
        url: '/payment/create-setup-intent',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useCreateCustomerMutation,
  useGetPaymentMethodsQuery,
  useCreateSetupIntentMutation,
} = stripeApi;
