export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[]; // List of person IDs sharing this item
}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface ReceiptData {
  storeName?: string;
  date?: string;
  items: ReceiptItem[];
  total: number;
  currency: string;
}

export interface AnalysisResponse {
  success: boolean;
  data?: ReceiptData;
  error?: string;
}

export interface PersonSummary {
  person: Person;
  items: {
    item: ReceiptItem;
    sharePrice: number;
    splitCount: number;
  }[];
  total: number;
}
