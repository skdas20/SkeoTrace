const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'PRODUCER' | 'RETAILER' | 'CONSUMER' | 'ADMIN';
}

export interface Batch {
  _id: string;
  batchId: string;
  productType: string;
  originFarm: string;
  harvestDate?: string;
  status: 'CREATED' | 'PROCESSING' | 'CERTIFIED' | 'IN_TRANSIT' | 'RECEIVED' | 'STORED' | 'SOLD';
  currentOwnerUserId?: string;
  certification?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    docUrl?: string;
    signedBy?: string;
    signedAt?: string;
  };
}

export interface Event {
  _id: string;
  batchId: string;
  type: string;
  payload: any;
  actorUserId: string;
  timestamp: string;
}

export interface TraceResponse {
  batch: Batch;
  timeline: Array<{
    type: string;
    at: string;
    by: string;
    payload: any;
  }>;
  integrity: {
    verified: boolean;
    blocks: number;
  };
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Producer
  async createBatch(data: {
    batchId: string;
    productType: string;
    originFarm: string;
    harvestDate?: string;
  }): Promise<Batch> {
    return this.request('/api/producer/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBatch(id: string, data: any): Promise<Batch> {
    return this.request(`/api/producer/batches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async transferBatch(id: string, toRetailerEmail: string, note?: string): Promise<void> {
    return this.request(`/api/producer/batches/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ toRetailerEmail, note }),
    });
  }

  async getMyBatches(): Promise<Batch[]> {
    const response = await this.request<{ batches: Batch[] }>('/api/producer/batches');
    return response.batches;
  }

  // Retailer
  async receiveBatch(id: string, note?: string): Promise<void> {
    return this.request(`/api/retailer/batches/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async storeBatch(id: string, note?: string): Promise<void> {
    return this.request(`/api/retailer/batches/${id}/store`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async sellBatch(id: string, note?: string): Promise<void> {
    return this.request(`/api/retailer/batches/${id}/sell`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async searchBatch(batchId: string): Promise<Batch> {
    return this.request(`/api/retailer/batches/search?batchId=${batchId}`);
  }

  async getRetailerBatches(): Promise<Batch[]> {
    const response = await this.request<{ batches: Batch[] }>('/api/retailer/batches');
    return response.batches;
  }

  // Admin
  async getUsers(): Promise<User[]> {
    const response = await this.request<{ users: User[] }>('/api/admin/users');
    return response.users;
  }

  async verifyChain(): Promise<{ ok: boolean; issues: string[] }> {
    return this.request('/api/admin/blocks/verify');
  }

  async getAudit(batchId: string): Promise<Event[]> {
    const response = await this.request<{ batchId: string; events: Event[] }>(`/api/admin/audit?batchId=${batchId}`);
    return response.events;
  }

  async getBlocks(): Promise<any[]> {
    const response = await this.request<{ blocks: any[]; pagination: any }>('/api/admin/blocks');
    return response.blocks;
  }

  // Public
  async trace(batchId: string): Promise<TraceResponse> {
    return this.request(`/api/public/trace/${batchId}`);
  }

  getQRCodeUrl(batchId: string): string {
    return `${this.baseURL}/api/public/qrcode/${batchId}`;
  }
}

export const api = new ApiClient();
