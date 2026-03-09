export type Repository = {
  id: string;
  name: string;
  source: string;
  sizeInBytes: number;
  created: string;
  updated: string;
  isPublic: boolean;
  message?: string;
};