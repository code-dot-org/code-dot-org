import type {School as SchoolSearchData} from '@/components/contentful/corporateSite/schoolSearchFieldset';

export type School = SchoolSearchData & {
  teachesCs?: string;
};

export interface YourSchoolProps {
  dataSourceURL: string;
  regionalPartnerURL: string;
  privacyPolicyURL: string;
  shareOnTwitterURL: string;
  shareOnFacebookURL: string;
}

export interface YourSchoolFormProps
  extends Pick<
    YourSchoolProps,
    | 'regionalPartnerURL'
    | 'privacyPolicyURL'
    | 'shareOnTwitterURL'
    | 'shareOnFacebookURL'
  > {
  school?: School | null;
}

export type YourSchoolFormData = {
  nces_school_s: string;
  submitter_email_address: string;
  submitter_name: string;
  submitter_role: string;
  how_many_do_hoc: string;
  how_many_after_school: string;
  how_many_10_hours: string;
  how_many_20_hours: string;
  topic_blocks: boolean;
  topic_text: boolean;
  topic_robots: boolean;
  topic_internet: boolean;
  topic_security: boolean;
  topic_data: boolean;
  topic_web_design: boolean;
  topic_game_design: boolean;
  topic_ethical_social: boolean;
  topic_do_not_know: boolean;
  topic_other: boolean;
  topic_other_description: string;
  class_frequency: string;
  tell_us_more: string;
  other_classes_under_20_hours: boolean;
  share_with_regional_partners: boolean;
  opt_in: boolean;
};
