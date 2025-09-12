import {WorkshopAction, WorkshopFormState} from '../../workshops/types';

export const workshopReducer = (
  state: WorkshopFormState,
  action: WorkshopAction
): WorkshopFormState => {
  switch (action.type) {
    case 'UPDATE_WORKSHOP':
      return {...state, ...action.payload};
    case 'ADD_GRADE': {
      const newGrades = state.grades.concat(action.payload);
      newGrades.sort((a, b) => {
        // sort 'K' to beginning
        if (a === 'K') return -1;
        if (b === 'K') return 1;
        // sort 'Other' to end
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        const numA = Number(a);
        const numB = Number(b);
        if (isNaN(numA) || isNaN(numB)) return 0;
        return numA - numB;
      });
      return {...state, grades: newGrades};
    }
    case 'REMOVE_GRADE':
      return {
        ...state,
        grades: state.grades.filter(grade => grade !== action.payload),
      };
    case 'ADD_COURSE_OFFERING':
      return {
        ...state,
        courseOfferings: [...state.courseOfferings, action.payload],
      };
    case 'REMOVE_COURSE_OFFERING':
      return {
        ...state,
        courseOfferings: state.courseOfferings.filter(
          offering => offering !== action.payload
        ),
      };
    case 'SET_COURSE_OFFERINGS':
      return {
        ...state,
        courseOfferings: action.payload,
      };
    case 'SET_WORKSHOP':
      return action.payload;
    default:
      return state;
  }
};
