import {MAX_NAME_LENGTH} from './constants';
export const getShortName = (studentName: string): string => {
  // If the student name contains a first and last name separated by whitespace, only use the first name.
  const first = studentName.split(/\s/)[0];
  // If the first name is longer than 10 characters, only use the first 10 characters.
  return first.length > 10 ? first.slice(0, MAX_NAME_LENGTH) : first;
};
