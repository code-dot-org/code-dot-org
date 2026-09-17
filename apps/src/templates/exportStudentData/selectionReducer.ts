import {Section, Selection, SectionSelection} from './types';

export type SelectionAction =
  | {type: 'TOGGLE_SECTION'; section: Section}
  | {type: 'TOGGLE_STUDENT'; section: Section; studentId: number}
  | {type: 'TOGGLE_UNIT'; section: Section; unitName: string}
  | {type: 'SET_ALL_STUDENTS'; section: Section; selected: boolean}
  | {type: 'SET_ALL_UNITS'; section: Section; selected: boolean};

export function initialSelection(): Selection {
  return {};
}

const emptySelection = (): SectionSelection => ({
  studentIds: new Set<number>(),
  unitNames: new Set<string>(),
});

const allSelected = (section: Section): SectionSelection => ({
  studentIds: new Set(section.students.map(student => student.id)),
  unitNames: new Set(section.units.map(unit => unit.name)),
});

const get = (state: Selection, section: Section): SectionSelection =>
  state[section.id] || emptySelection();

const toggle = <T>(set: Set<T>, value: T): Set<T> => {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
};

export function selectionReducer(
  state: Selection,
  action: SelectionAction
): Selection {
  const {section} = action;
  const current = get(state, section);

  switch (action.type) {
    case 'TOGGLE_SECTION': {
      const isFullySelected =
        current.studentIds.size === section.students.length &&
        section.students.length > 0;
      return {
        ...state,
        [section.id]: isFullySelected ? emptySelection() : allSelected(section),
      };
    }

    case 'TOGGLE_STUDENT': {
      const studentIds = toggle(current.studentIds, action.studentId);
      return {...state, [section.id]: {...current, studentIds}};
    }

    case 'TOGGLE_UNIT': {
      return {
        ...state,
        [section.id]: {
          ...current,
          unitNames: toggle(current.unitNames, action.unitName),
        },
      };
    }

    case 'SET_ALL_STUDENTS': {
      const studentIds = action.selected
        ? new Set(section.students.map(student => student.id))
        : new Set<number>();
      return {...state, [section.id]: {...current, studentIds}};
    }

    case 'SET_ALL_UNITS': {
      const unitNames = action.selected
        ? new Set(section.units.map(unit => unit.name))
        : new Set<string>();
      return {...state, [section.id]: {...current, unitNames}};
    }

    default:
      return state;
  }
}

export type CheckedState = 'checked' | 'unchecked' | 'indeterminate';

export function checkedState(selected: number, total: number): CheckedState {
  if (selected === 0 || total === 0) {
    return 'unchecked';
  }
  return selected === total ? 'checked' : 'indeterminate';
}
