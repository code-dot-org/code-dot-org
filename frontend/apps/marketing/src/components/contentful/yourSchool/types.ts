import type {School as SchoolSearchData} from '@/components/contentful/schoolSearchFieldset';

export type School = SchoolSearchData & {
  isNew?: boolean;
  teachesCs?: string;
};
