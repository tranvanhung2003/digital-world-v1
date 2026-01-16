import { ProductRecommendation, ChatAction } from '../services/chatbotApi';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
  suggestions?: string[];
  products?: ProductRecommendation[];
  actions?: ChatAction[];
}
