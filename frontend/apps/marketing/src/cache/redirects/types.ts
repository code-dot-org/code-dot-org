import {Brand} from '@/config/brand';

export interface RedirectEntry {
  brand: Brand;
  source: string;
  destination: string;
  permanent: boolean;
}
