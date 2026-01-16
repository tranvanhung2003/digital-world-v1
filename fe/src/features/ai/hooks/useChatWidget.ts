// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react';
import { CHAT_WIDGET_CONFIG, GREETING_MESSAGE } from '../constants/chatWidget';
import { Message } from '../components/ChatWidget';

export const useChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(CHAT_WIDGET_CONFIG.DEFAULT_SIZE);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  // Load kích thước đã lưu từ localStorage
  useEffect(() => {
    try {
      const savedSize = localStorage.getItem(
        CHAT_WIDGET_CONFIG.STORAGE_KEYS.SIZE,
      );

      if (savedSize) {
        setSize(JSON.parse(savedSize));
      }
    } catch (error) {
      console.error('Lỗi khi tải kích thước widget chat đã lưu:', error);
    }
  }, []);

  // Khởi tạo tin nhắn chào mừng
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = {
        ...GREETING_MESSAGE,
        id: Date.now().toString(),
      };
      setMessages([greeting]);
    }
  }, [messages.length]);

  // Tự động cuộn xuống dưới khi tin nhắn thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Xử lý thay đổi trạng thái mở/đóng
  useEffect(() => {
    isOpenRef.current = isOpen;

    if (isOpen) {
      document.body.classList.add('chat-widget-open');

      // Tính toán vị trí trung tâm
      const centerX = Math.max(0, (window.innerWidth - size.width) / 2);
      const bottomY = Math.max(
        0,
        window.innerHeight -
          size.height -
          CHAT_WIDGET_CONFIG.POSITION_OFFSET.bottom,
      );
      setPosition({ x: centerX, y: bottomY });

      // Ngăn chặn click bên ngoài đóng
      const preventClose = (e: MouseEvent) => {
        if (
          chatWidgetRef.current &&
          !chatWidgetRef.current.contains(e.target as Node)
        ) {
          e.stopPropagation();
        }
      };

      const preventEscapeClose = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          e.preventDefault();
        }
      };

      document.addEventListener('click', preventClose, true);
      document.addEventListener('mousedown', preventClose, true);
      document.addEventListener('keydown', preventEscapeClose, true);

      return () => {
        document.removeEventListener('click', preventClose, true);
        document.removeEventListener('mousedown', preventClose, true);
        document.removeEventListener('keydown', preventEscapeClose, true);
        document.body.classList.remove('chat-widget-open');
      };
    } else {
      document.body.classList.remove('chat-widget-open');
    }
  }, [isOpen, size.width, size.height]);

  // Xử lý thay đổi kích thước cửa sổ
  useEffect(() => {
    if (isOpen) {
      const handleWindowResize = () => {
        const centerX = Math.max(0, (window.innerWidth - size.width) / 2);
        const bottomY = Math.max(
          0,
          window.innerHeight -
            size.height -
            CHAT_WIDGET_CONFIG.POSITION_OFFSET.bottom,
        );
        setPosition({ x: centerX, y: bottomY });
      };

      window.addEventListener('resize', handleWindowResize);
      return () => window.removeEventListener('resize', handleWindowResize);
    }
  }, [isOpen, size.width, size.height]);

  const toggleChat = useCallback(
    (event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }

      if (isOpen) return; // Chỉ cho phép mở, không cho phép đóng

      setIsOpen(true);
      isOpenRef.current = true;
    },
    [isOpen],
  );

  const closeChat = useCallback((event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setIsOpen(false);
    isOpenRef.current = false;
    document.body.classList.remove('chat-widget-open');
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      );
    },
    [],
  );

  const applyChanges = useCallback(() => {
    localStorage.setItem(
      CHAT_WIDGET_CONFIG.STORAGE_KEYS.SIZE,
      JSON.stringify(size),
    );

    const confirmMessage: Message = {
      id: Date.now().toString(),
      text: 'Đã áp dụng thay đổi! Kích thước cửa sổ chat đã được lưu.',
      sender: 'ai',
      suggestions: ['Cảm ơn', 'Tùy chỉnh thêm'],
    };

    addMessage(confirmMessage);
  }, [size, addMessage]);

  return {
    // State
    isOpen,
    position,
    size,
    messages,

    // Refs
    messagesEndRef,
    chatWidgetRef,
    isOpenRef,

    // Actions
    toggleChat,
    closeChat,
    addMessage,
    removeMessage,
    updateMessage,
    applyChanges,
    setSize,
    setPosition,
    setMessages,
  };
};
