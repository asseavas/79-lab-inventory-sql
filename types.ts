export interface ApiCategory {
  title: string;
  description: string | null;
}

export interface Category extends ApiCategory {
  id: number;
}
