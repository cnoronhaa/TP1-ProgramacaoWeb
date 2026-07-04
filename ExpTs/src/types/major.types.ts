export interface CreateMajorInput {
  name: string;
  code: string;
  description: string;
}

export interface UpdateMajorInput {
  name?: string;
  code?: string;
  description?: string;
}