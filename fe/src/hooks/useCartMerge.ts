import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useMergeCartMutation,
  useAddToCartMutation,
  useGetCartQuery,
} from '@/services/cartApi';
import { setServerCart } from '@/features/cart/cartSlice';
import { addNotification } from '@/features/ui/uiSlice';
import { clearJustLoggedIn } from '@/features/auth/authSlice';
import { RootState } from '@/store';

export const useCartMerge = (
  isAuthenticated: boolean,
  justLoggedIn: boolean,
) => {
  const dispatch = useDispatch();

  const [mergeCart] = useMergeCartMutation();
  const [addToCart] = useAddToCartMutation();

  // Lấy cart items từ Redux store
  const { items } = useSelector((state: RootState) => state.cart);

  // Lấy giỏ hàng hiện tại từ server - không bỏ qua khi đã xác thực và vừa đăng nhập
  const { data: serverCart, refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated, // bỏ qua nếu chưa xác thực (khách vãng lai)
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const performCartMerge = async () => {
      // Chỉ thực hiện gộp khi người dùng vừa đăng nhập
      if (isAuthenticated && justLoggedIn) {
        try {
          console.log('Đang kiểm tra các mục giỏ hàng local trước khi gộp...');

          // Kiểm tra xem các mục giỏ hàng có trong localStorage không
          const localItems = JSON.parse(
            localStorage.getItem('cartItems') || '[]',
          );

          if (localItems.length > 0) {
            console.log('Đã tìm thấy các mục giỏ hàng local:', localItems);

            // Lấy giỏ hàng hiện tại từ server
            await refetch();

            // Thêm từng mục local vào giỏ hàng server
            console.log('Đang thêm các mục local vào giỏ hàng server...');

            // Đặt biến đếm theo dõi số item đã thêm để thông báo
            let addedItemsCount = 0;

            // Thêm từng mục một để giữ nguyên các mục giỏ hàng hiện có
            for (const item of localItems) {
              try {
                await addToCart({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                }).unwrap();

                addedItemsCount += item.quantity;
                console.log(`Đã thêm mục ${item.name} vào giỏ hàng`);
              } catch (itemError) {
                console.error(
                  `Không thể thêm mục ${item.name} vào giỏ hàng:`,
                  itemError,
                );
              }
            }

            // Lấy lại giỏ hàng sau khi thêm tất cả các mục
            try {
              const result = await refetch();

              if (result && result.data) {
                // Cập nhật Redux store với giỏ hàng cuối cùng
                dispatch(setServerCart(result.data));

                console.log('Gộp giỏ hàng thành công:', result.data);
              } else if (serverCart) {
                // Dự phòng sử dụng serverCart hiện tại nếu refetch không trả về dữ liệu mới
                dispatch(setServerCart(serverCart));

                console.log(
                  'Gộp giỏ hàng thành công (sử dụng dữ liệu hiện tại):',
                  serverCart,
                );
              }
            } catch (refetchError) {
              console.error('Không thể lấy lại giỏ hàng:', refetchError);

              // Vẫn cố gắng sử dụng serverCart hiện tại nếu có
              if (serverCart) {
                dispatch(setServerCart(serverCart));
              }
            }

            // Hiện thông báo về các mục giỏ hàng đã gộp
            if (addedItemsCount > 0) {
              dispatch(
                addNotification({
                  message: `Đã thêm ${addedItemsCount} sản phẩm vào giỏ hàng của bạn`,
                  type: 'success',
                  duration: 3000,
                }),
              );
            }
          } else {
            // Nếu không có mục giỏ hàng local, chỉ cần gộp giỏ hàng session trên server
            console.log(
              'Không có các mục giỏ hàng local, đang kiểm tra giỏ hàng session trên server...',
            );

            const mergedCart = await mergeCart().unwrap();

            // Cập nhật Redux store với giỏ hàng đã gộp
            dispatch(setServerCart(mergedCart));

            console.log('Gộp giỏ hàng server thành công:', mergedCart);

            // Hiện thông báo nếu có mục đã được gộp
            if (mergedCart.totalItems > 0) {
              dispatch(
                addNotification({
                  message: `Đã gộp ${mergedCart.totalItems} sản phẩm vào giỏ hàng của bạn`,
                  type: 'success',
                  duration: 3000,
                }),
              );
            }
          }

          // Xóa giỏ hàng ở localStorage để tránh trùng lặp mục
          localStorage.removeItem('cartItems');

          // Đặt lại flag justLoggedIn để tránh việc gộp giỏ hàng lại khi reload trang
          dispatch(clearJustLoggedIn());
        } catch (error: any) {
          console.error('Gộp giỏ hàng thất bại:', error);

          // Đặt lại flag justLoggedIn ngay cả khi gặp lỗi để tránh lặp lại quá trình gộp
          dispatch(clearJustLoggedIn());

          // Hiện thông báo lỗi cho người dùng
          dispatch(
            addNotification({
              message: 'Không thể gộp giỏ hàng. Vui lòng thử lại sau.',
              type: 'error',
              duration: 3000,
            }),
          );
        }
      }
    };

    performCartMerge();
  }, [
    isAuthenticated,
    justLoggedIn,
    mergeCart,
    addToCart,
    refetch,
    dispatch,
    // items,
  ]);
};
