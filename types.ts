export interface ApiCategory {
  title: string;
  description: string | null;
}

export interface Category extends ApiCategory {
  id: number;
}

export interface ApiPlace {
  title: string;
  description: string | null;
}

export interface Place extends ApiPlace {
  id: number;
}
