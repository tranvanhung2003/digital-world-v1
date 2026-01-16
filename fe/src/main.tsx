import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { initializeCart } from '@/features/cart/cartSlice';
import './config/i18n'; // Khởi tạo i18n
import App from './App';

// Khởi tạo giỏ hàng từ localStorage
store.dispatch(initializeCart());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
