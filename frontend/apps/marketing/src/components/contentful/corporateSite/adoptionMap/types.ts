import type {School as SchoolSearchData} from '@/components/contentful/corporateSite/schoolSearchFieldset';

export type School = SchoolSearchData & {
  teachesCs?: string;
};
