export function getFullName(student: {
  name: string;
  familyName: string;
}): string;
export function getFullName(name: string, familyName?: string): string;

export function getFullName(
  studentOrName: {name: string; familyName: string} | string,
  familyName?: string
): string {
  if (typeof studentOrName === 'string') {
    // If the first argument is a string, assume it's the name and the second argument is the familyName
    return familyName ? `${studentOrName} ${familyName}` : studentOrName;
  } else {
    // If the first argument is an object, extract the name and familyName from the object
    return studentOrName.familyName
      ? `${studentOrName.name} ${studentOrName.familyName}`
      : studentOrName.name;
  }
}
