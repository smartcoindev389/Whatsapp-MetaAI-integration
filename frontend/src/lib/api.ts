const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
      
      const error = await response.json().catch(() => ({ 
        message: `Request failed with status ${response.status}` 
      }));
      throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  // Shops
  async getShops() {
    return this.request<any[]>('/shops');
  }

  async createShop(name: string) {
    return this.request<any>('/shops', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getShop(id: string) {
    return this.request<any>(`/shops/${id}`);
  }

  // WABA
  async getEmbeddedSignupUrl(shopId?: string) {
    const params = shopId ? `?shopId=${shopId}` : '';
    return this.request<{ url: string }>(`/waba/embedded/start${params}`);
  }

  // Messages
  async sendMessage(wabaAccountId: string, to: string, body: string) {
    return this.request<any>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ wabaAccountId, to, body }),
    });
  }

  async sendTemplateMessage(
    wabaAccountId: string,
    to: string,
    templateName: string,
    language: string,
    parameters?: string[],
  ) {
    return this.request<any>('/messages/template', {
      method: 'POST',
      body: JSON.stringify({ wabaAccountId, to, templateName, language, parameters }),
    });
  }

  // Inbox
  async getConversations(wabaAccountId: string, page: number = 1, limit: number = 50) {
    return this.request<any>(`/inbox/conversations?wabaAccountId=${wabaAccountId}&page=${page}&limit=${limit}`);
  }

  async getConversationMessages(conversationId: string, page: number = 1, limit: number = 50) {
    return this.request<any>(`/inbox/conversations/${conversationId}?page=${page}&limit=${limit}`);
  }

  // Templates
  async getTemplates(wabaAccountId: string) {
    return this.request<any[]>(`/templates?wabaAccountId=${wabaAccountId}`);
  }

  async submitTemplate(wabaAccountId: string, templateData: any) {
    return this.request<any>(`/templates/submit?wabaAccountId=${wabaAccountId}`, {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateTemplate(id: string, status: string, history?: any) {
    return this.request<any>(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, history }),
    });
  }

  // Campaigns
  async getCampaigns(wabaAccountId: string) {
    return this.request<any[]>(`/campaigns?wabaAccountId=${wabaAccountId}`);
  }

  async createCampaign(wabaAccountId: string, templateId: string | null, contactNumbers: string[]) {
    return this.request<any>('/campaigns', {
      method: 'POST',
      body: JSON.stringify({ wabaAccountId, templateId, contactNumbers }),
    });
  }

  async getCampaign(id: string) {
    return this.request<any>(`/campaigns/${id}`);
  }

  // Dashboard
  async getDashboardStats(wabaAccountId: string) {
    // This would need to be implemented in the backend
    // For now, we'll calculate from messages
    const messages = await this.request<any[]>(`/inbox/conversations?wabaAccountId=${wabaAccountId}&limit=1000`);
    // TODO: Implement proper stats endpoint
    return {
      messages_sent_24h: 0,
      messages_delivered_24h: 0,
      messages_read_24h: 0,
      messages_failed_24h: 0,
      active_conversations: messages.data?.length || 0,
      queue_size: 0,
      delivery_rate: 0,
      read_rate: 0,
    };
  }
}

export const api = new ApiClient(API_BASE_URL);

