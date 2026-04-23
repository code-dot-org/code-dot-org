import {DemoType} from '../../teacherDashboard/types/teacherSectionTypes';

export const pickDemoType = (
  gradesTeaching: string[] | null | undefined
): DemoType => {
  const grades = new Set((gradesTeaching || []).map(String));

  if (['9', '10', '11', '12'].some(grade => grades.has(grade))) {
    return 'high';
  }

  if (['6', '7', '8'].some(grade => grades.has(grade))) {
    return 'middle';
  }

  if (['K', '1', '2', '3', '4', '5'].some(grade => grades.has(grade))) {
    return 'elementary';
  }

  return 'high';
};
