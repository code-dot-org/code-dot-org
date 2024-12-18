export interface SchoolDropdownOption {
  value: string;
  text: string;
}

export interface SchoolInfoInitialState {
  schoolId?: string;
  country?: string;
  schoolName?: string;
  schoolZip?: string;
  schoolType?: string;
  usIp?: boolean;
}

export interface SchoolInfoRequest {
  country?: string;
  school_name?: string;
  zip?: string;
  school_type?: string;
  school_id?: string;
}
