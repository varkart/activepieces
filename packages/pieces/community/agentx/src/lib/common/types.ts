export interface AgentXAgent {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentXConversation {
  id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  messages?: AgentXMessage[];
}

export interface AgentXMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface AgentXApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}
