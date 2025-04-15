export interface Transaction {
  id: string;
  description: string;
  type: 'income' | 'outcome';
  category: string;
  price: number;
  createdAt: string;
}

export interface CreateTransactionInput {
  description: string;
  type: 'income' | 'outcome';
  category: string;
  price: number;
}

export interface TransactionFilters {
  type?: 'income' | 'outcome';
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExportableTransaction {
  date: string;
  type: 'income' | 'outcome';
  amount: number;
  category?: {
    name: string;
    color: string;
  };
  description: string;
} 