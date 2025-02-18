import {SchoolDropdownOption} from '../types';

export function constructSchoolOption(school: {
  nces_id: number;
  name: string;
}): SchoolDropdownOption {
  return {
    value: school.nces_id.toString(),
    text: school.name,
  };
}
