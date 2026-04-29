import { JSONFilePreset } from 'lowdb/node';

export interface Extraction {
  id: string;
  url: string;
  instruction: string;
  fields: string[];
  rows: any[];
  summary: string;
  confidence: number;
  timestamp: string;
  userId: string;
}

export interface UserUsage {
  userId: string;
  creditsRemaining: number;
  creditsLimit: number;
  plan: 'Free' | 'Pro' | 'Business';
  billingStatus: 'active' | 'past_due' | 'canceled';
}

export interface APIKey {
  key: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Data {
  extractions: Extraction[];
  usage: UserUsage[];
  apiKeys: APIKey[];
}

const defaultData: Data = {
  extractions: [],
  usage: [
    {
      userId: 'anonymous',
      creditsRemaining: 10,
      creditsLimit: 10,
      plan: 'Free',
      billingStatus: 'active'
    }
  ],
  apiKeys: []
};

// Initialize the database with default data
export const getDb = async () => {
  return await JSONFilePreset<Data>('db.json', defaultData);
};
