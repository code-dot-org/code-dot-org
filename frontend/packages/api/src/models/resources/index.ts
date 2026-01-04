/** Defines a resource in internal unit data */
export interface ResourceDefinition {
  name: string;
  url: string;
  key: string;
  properties: {
    is_rollup?: boolean;
    audience?: 'Student' | 'Teacher' | 'Verified Teacher';
    type?: string;
    include_in_pdf?: boolean;
    download_url?: string;
  };
  seeding_key: {
    ['resource.key']: string;
  };
}
