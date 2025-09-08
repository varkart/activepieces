import {
  HttpMethod,
  httpClient,
  AuthenticationType,
} from '@activepieces/pieces-common';
import { 
  AgentXAgent, 
  AgentXConversation, 
  AgentXMessage, 
  AgentXApiResponse
} from './types';

const BASE_URL = 'https://api.agentx.so/api/v1';

export interface AgentXClientConfig {
  apiKey: string;
}

export class AgentXClient {
  constructor(private config: AgentXClientConfig) {}

  private async makeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const response = await httpClient.sendRequest<T>({
      method,
      url: `${BASE_URL}${endpoint}`,
      body,
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: this.config.apiKey,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.body;
  }

  // Agent methods
  async getAgents(): Promise<AgentXAgent[]> {
    const response = await this.makeRequest<AgentXApiResponse<AgentXAgent[]>>(
      HttpMethod.GET,
      '/access-agents'
    );
    return response.data || [];
  }

  async searchAgents(query?: string): Promise<AgentXAgent[]> {
    const queryString = query ? `?query=${encodeURIComponent(query)}` : '';
    const response = await this.makeRequest<AgentXApiResponse<AgentXAgent[]>>(
      HttpMethod.GET,
      `/access-agents${queryString}`
    );
    return response.data || [];
  }

  async getAgent(agentId: string): Promise<AgentXAgent | null> {
    try {
      const response = await this.makeRequest<AgentXApiResponse<AgentXAgent>>(
        HttpMethod.GET,
        `/access-agents/${agentId}`
      );
      return response.data;
    } catch {
      return null;
    }
  }

  // Conversation methods
  async getConversations(agentId?: string): Promise<AgentXConversation[]> {
    const queryString = agentId ? `?agent_id=${agentId}` : '';
    const response = await this.makeRequest<AgentXApiResponse<AgentXConversation[]>>(
      HttpMethod.GET,
      `/conversations${queryString}`
    );
    return response.data || [];
  }

  async getConversation(conversationId: string): Promise<AgentXConversation | null> {
    try {
      const response = await this.makeRequest<AgentXApiResponse<AgentXConversation>>(
        HttpMethod.GET,
        `/conversations/${conversationId}`
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async createConversation(agentId: string, initialMessage?: string): Promise<AgentXConversation> {
    const response = await this.makeRequest<AgentXApiResponse<AgentXConversation>>(
      HttpMethod.POST,
      '/conversations',
      {
        agent_id: agentId,
        ...(initialMessage && { initial_message: initialMessage }),
      }
    );
    return response.data;
  }

  // Message methods
  async getMessages(conversationId: string): Promise<AgentXMessage[]> {
    const response = await this.makeRequest<AgentXApiResponse<AgentXMessage[]>>(
      HttpMethod.GET,
      `/conversations/${conversationId}/messages`
    );
    return response.data || [];
  }

  async getMessage(messageId: string): Promise<AgentXMessage | null> {
    try {
      const response = await this.makeRequest<AgentXApiResponse<AgentXMessage>>(
        HttpMethod.GET,
        `/messages/${messageId}`
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<AgentXMessage> {
    const response = await this.makeRequest<AgentXApiResponse<AgentXMessage>>(
      HttpMethod.POST,
      `/conversations/${conversationId}/messages`,
      {
        content,
      }
    );
    return response.data;
  }
}

export function createAgentXClient(apiKey: string): AgentXClient {
  return new AgentXClient({ apiKey });
}
