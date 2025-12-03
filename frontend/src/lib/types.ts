export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  billing_plan: string;
  quota_limits: number;
}

export interface WABAAccount {
  id: string;
  tenant_id: string;
  waba_id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  token_expires_at: string;
}

export interface PhoneNumber {
  id: string;
  waba_id: string;
  phone_id: string;
  number: string;
  verified: boolean;
  status: 'active' | 'inactive';
}

export interface Template {
  id: string;
  tenant_id: string;
  name: string;
  language: string;
  category: string;
  components: TemplateComponent[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: string;
  text?: string;
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: string;
  text: string;
  url?: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  phone_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  last_message_at: string;
  status: 'open' | 'closed';
  unread_count: number;
  tags?: string[];
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  whatsapp_message_id: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  attempts?: number;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  template_id: string;
  segment_filters: Record<string, any>;
  schedule: string;
  throttle: number;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: string;
}

export interface DashboardStats {
  messages_sent_24h: number;
  messages_delivered_24h: number;
  messages_read_24h: number;
  messages_failed_24h: number;
  active_conversations: number;
  queue_size: number;
  delivery_rate: number;
  read_rate: number;
}
