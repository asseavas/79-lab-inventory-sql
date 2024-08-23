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

export interface Item {
  id: number;
  category_id: number;
  place_id: number;
  title: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

export interface ApiItem {
  category_id: number;
  place_id: number;
  title: string;
  description: string | null;
  image: string | null;
}
