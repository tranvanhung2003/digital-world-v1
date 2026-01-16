import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RootState } from '@/store';
import { Message } from '../types/Message';
import { useSendChatbotMessageMutation } from '../services/chatbotApi';
import { geminiService } from '../services/geminiService';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
// Import trực tiếp từ file icon
import ChatIcon from './icons/ChatIcon';
import CloseIcon from './icons/CloseIcon';
import './ChatWidget.css';

const ChatWidgetPortal: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  // Sử dụng hook mutation để gửi tin nhắn đến chatbot
  const [sendChatbotMessage, { isLoading }] = useSendChatbotMessageMutation();

  // Tạo session ID duy nhất cho mỗi phiên trò chuyện
  const [sessionId] = useState<string>(
    () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  );

  // Hiển thị tin nhắn chào mừng khi mở chatbot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingText =
        isAuthenticated && user
          ? t('chat.greetingWithName', {
              name: `${user.firstName} ${user.lastName}`,
            }) ||
            `Chào ${user.firstName} ${user.lastName}! Tôi là trợ lý AI của DigitalWorld! Tôi có thể giúp bạn tìm sản phẩm, xem khuyến mãi và hỗ trợ mua hàng. Bạn cần gì nhỉ?`
          : t('chat.greeting') ||
            'Chào bạn! Tôi là trợ lý AI của DigitalWorld! Tôi có thể giúp bạn tìm sản phẩm, xem khuyến mãi và hỗ trợ mua hàng. Bạn cần gì nhỉ?';

      const greeting = {
        id: Date.now().toString(),
        text: greetingText,
        sender: 'ai' as const,
        suggestions: [
          t('chat.suggestions.findProducts') || 'Tìm sản phẩm hot 🔥',
          t('chat.suggestions.viewPromotions') || 'Xem khuyến mãi 🎉',
          t('chat.suggestions.howToOrder') || 'Hướng dẫn mua hàng',
          t('chat.suggestions.returnPolicy') || 'Chính sách đổi trả',
        ],
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length, isAuthenticated, user, t]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Thêm class vào body khi chatbot mở
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('chat-widget-open');
    } else {
      document.body.classList.remove('chat-widget-open');
    }

    return () => {
      document.body.classList.remove('chat-widget-open');
    };
  }, [isOpen]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (text: string) => {
    // Nếu tin nhắn rỗng thì không gửi
    if (!text.trim()) return;

    // Thêm tin nhắn của người dùng
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);

    // Thêm tin nhắn "đang nhập" tạm thời - chỉ hiển thị một dấu ba chấm
    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        text: '',
        sender: 'ai',
        isLoading: true,
      },
    ]);

    try {
      console.log('Đang gửi tin nhắn cho AI:', text);

      // Thêm timeout để tránh treo UI nếu API quá chậm
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      // Gọi API với timeout và xử lý lỗi
      let response: any;
      try {
        // Dùng Promise.race để nếu quá thời gian mà chưa có phản hồi thì ném lỗi timeout
        response = await Promise.race([
          sendChatbotMessage({
            message: text,
            userId: user?.id,
            sessionId: sessionId,
            context: {
              isAuthenticated,
              currentPage: window.location.pathname,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
            },
          }).unwrap(), // Unwrap để lấy dữ liệu thực, ném lỗi khi có lỗi
          timeoutPromise,
        ]);
      } catch (innerError: any) {
        console.error('Lỗi bên trong khi gọi API:', innerError);
        throw innerError;
      }

      console.log('Đã nhận phản hồi từ AI:', response);

      // Xóa tin nhắn "đang nhập" và thêm phản hồi từ API
      if (response.status === 'success' && response.data) {
        setMessages((prev) => {
          // Lọc bỏ tin nhắn "đang nhập" của AI
          const filtered = prev.filter((msg) => msg.id !== loadingId);

          // Thêm phản hồi mới từ AI vào danh sách tin nhắn
          return [
            ...filtered,
            {
              id: (Date.now() + 2).toString(),
              text: response.data.response,
              sender: 'ai',
              suggestions: response.data.suggestions || [
                t('chat.suggestions.findProducts') || 'Tìm thêm sản phẩm',
                t('chat.suggestions.viewCart') || 'Xem giỏ hàng',
                t('chat.suggestions.askMore') || 'Hỏi thêm',
              ],
              products: response.data.products,
              actions: response.data.actions,
            },
          ];
        });
      } else {
        // Nếu API trả về lỗi, ném lỗi để xử lý bên ngoài
        throw new Error(response.message || 'Lỗi không xác định');
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo phản hồi AI:', error);

      // Xác định thông báo lỗi phù hợp
      let errorMessage =
        t('chat.errors.general') ||
        'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';

      if (error.message === 'Request timeout') {
        errorMessage =
          t('chat.errors.timeout') ||
          'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.';
      } else if (error.status === 404) {
        errorMessage =
          t('chat.errors.notFound') ||
          'Không tìm thấy dịch vụ AI. Vui lòng thử lại sau.';
      } else if (error.status === 429) {
        errorMessage =
          t('chat.errors.tooManyRequests') ||
          'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
      } else if (error.status >= 500) {
        errorMessage =
          t('chat.errors.serverError') || 'Lỗi máy chủ. Vui lòng thử lại sau.';
      }

      // Xóa tin nhắn "đang nhập" và thêm thông báo lỗi
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingId);

        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            text: errorMessage,
            sender: 'ai',
            suggestions: [
              t('chat.suggestions.tryAgain') || 'Thử lại',
              t('chat.suggestions.findProducts') || 'Tìm sản phẩm',
              t('chat.suggestions.contactSupport') || 'Liên hệ hỗ trợ',
            ],
          },
        ];
      });
    }
  };

  // Xử lý khi người dùng nhấn vào gợi ý
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Xóa tất cả tin nhắn
  const handleClearChat = () => {
    setMessages([]);
  };

  // Mở/đóng chatbot
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      <button
        onClick={toggleChat}
        className="group relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white rounded-full p-4 shadow-[0_8px_25px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.45)] transform hover:scale-110 transition-all duration-300 flex items-center justify-center ring-4 ring-primary-500/20 hover:ring-primary-500/40"
        aria-label={isOpen ? t('chat.closeChat') : t('chat.openChat')}
      >
        {!isOpen && (
          <>
            <div
              className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-25"
              style={{ animationDuration: '2s' }}
            ></div>
            <div
              className="absolute inset-0 rounded-full bg-primary-300 animate-ping opacity-15 animation-delay-75"
              style={{ animationDuration: '2.5s' }}
            ></div>
          </>
        )}

        <div
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg ${
            geminiService.isReady()
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          }`}
        >
          <div
            className={`absolute inset-0.5 rounded-full ${
              geminiService.isReady()
                ? 'bg-green-300 animate-pulse'
                : 'bg-yellow-300 animate-pulse'
            }`}
            style={{ animationDuration: '1.5s' }}
          ></div>
        </div>

        {isOpen ? (
          <CloseIcon className="h-7 w-7 transform transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <div className="relative">
            <ChatIcon className="transform transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}
      </button>

      {/* Chat widget */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/5 z-[9998]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                toggleChat();
              }
            }}
          />

          <div
            ref={chatContainerRef}
            className="fixed inset-x-4 bottom-20 sm:absolute sm:bottom-20 sm:right-0 sm:inset-x-auto w-auto sm:w-96 md:max-w-md lg:max-w-lg xl:max-w-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col border border-white/20 dark:border-neutral-700/30 transform animate-in slide-in-from-bottom-4 duration-500 max-h-[85vh] sm:max-h-[75vh] md:max-h-[70vh] chat-widget-active z-[9999] hover:shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat header */}
            <ChatHeader onClose={toggleChat} geminiService={geminiService} />

            {/* Chat messages */}
            <ChatMessages
              messages={messages}
              onSuggestionClick={handleSuggestionClick}
              messagesEndRef={messagesEndRef}
              user={user}
            />

            {/* Chat input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onClearChat={handleClearChat}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidgetPortal;
