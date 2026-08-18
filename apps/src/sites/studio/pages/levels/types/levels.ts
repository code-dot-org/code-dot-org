export interface Level {
  id: number;
  name: string;
  type: string;
  owner?: string;
  permissions: {
    can_edit: boolean;
    can_destroy: boolean;
    can_clone: boolean;
    can_show: boolean;
  };
  urls: {
    show: string;
    edit: string;
    clone: string;
    destroy: string;
  };
}

export interface SearchField {
  name: string;
  description: string;
  type: 'text' | 'select';
  options?: Array<[string, string]>;
}

export interface LevelsResponse {
  levels: Level[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  search_fields: SearchField[];
  can_create: boolean;
  new_level_url: string;
}

export interface SearchParams {
  name?: string;
  level_type?: string;
  script_id?: string;
  owner_id?: string;
  page?: number;
}

export interface CloneResponse {
  success: boolean;
  level?: {
    id: number;
    name: string;
    edit_url: string;
  };
  error?: string;
}
