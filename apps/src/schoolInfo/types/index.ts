export interface SchoolDropdownOption {
  value: string;
  text: string;
}
export interface SchoolInfoRequest {
  user: SchoolInfoAttributes;
}

export interface SchoolInfoAttributes {
  school_info_attributes:
    | SchoolInfoRequestWithSchoolId
    | SchoolInfoRequestWithoutSchoolId;
}

export interface SchoolInfoInitialState {
  schoolId?: string;
  country?: string;
  schoolName?: string;
  schoolZip?: string;
  schoolType?: string;
  usIp?: boolean;
}

export interface SchoolInfoRequestWithSchoolId {
  school_id: string;
}

export interface SchoolInfoRequestWithoutSchoolId {
  country: string;
  school_name?: string;
  zip?: string;
  school_type?: string;
}
