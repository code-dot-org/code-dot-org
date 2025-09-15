import {workshopReducer} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/reducers/workshopReducer';
import {
  WorkshopAction,
  WorkshopFormState,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';

describe('workshopReducer', () => {
  const initialState: WorkshopFormState = {
    course: 'Test Course',
    capacity: '',
    description: '',
    facilitators: [],
    fee: '',
    grades: [],
    hidden: false,
    name: '',
    notes: '',
    organizerId: null,
    prereq: '',
    hasPrereq: false,
    regionalPartnerId: null,
    registrationLink: '',
    subject: '',
    suppressEmail: false,
    courseOfferings: [],
    participantGroupType: '',
    timeZone: 'America/Los_Angeles',
  };

  it('should handle UPDATE_WORKSHOP', () => {
    const action: WorkshopAction = {
      type: 'UPDATE_WORKSHOP',
      payload: {name: 'Updated Name'},
    };
    const newState = workshopReducer(initialState, action);
    expect(newState.name).toEqual('Updated Name');
  });

  it('should handle ADD_GRADE', () => {
    const action: WorkshopAction = {type: 'ADD_GRADE', payload: 'K'};
    const newState = workshopReducer(initialState, action);
    expect(newState.grades).toEqual(['K']);
  });

  it('should handle REMOVE_GRADE', () => {
    const stateWithGrade = {...initialState, grades: ['K', '1']};
    const action: WorkshopAction = {type: 'REMOVE_GRADE', payload: 'K'};
    const newState = workshopReducer(stateWithGrade, action);
    expect(newState.grades).toEqual(['1']);
  });

  it('should handle ADD_COURSE_OFFERING', () => {
    const action: WorkshopAction = {
      type: 'ADD_COURSE_OFFERING',
      payload: '1',
    };
    const newState = workshopReducer(initialState, action);
    expect(newState.courseOfferings).toEqual(['1']);
  });

  it('should handle REMOVE_COURSE_OFFERING', () => {
    const stateWithOffering = {...initialState, courseOfferings: ['1', '2']};
    const action: WorkshopAction = {
      type: 'REMOVE_COURSE_OFFERING',
      payload: '1',
    };
    const newState = workshopReducer(stateWithOffering, action);
    expect(newState.courseOfferings).toEqual(['2']);
  });

  it('should handle SET_COURSE_OFFERINGS', () => {
    const action: WorkshopAction = {
      type: 'SET_COURSE_OFFERINGS',
      payload: ['1', '2', '3'],
    };
    const newState = workshopReducer(initialState, action);
    expect(newState.courseOfferings).toEqual(['1', '2', '3']);
  });

  it('should handle SET_WORKSHOP', () => {
    const action: WorkshopAction = {
      type: 'SET_WORKSHOP',
      payload: {
        ...initialState,
        name: 'New Workshop',
      },
    };
    const newState = workshopReducer(initialState, action);
    expect(newState.name).toEqual('New Workshop');
  });

  it('should return the current state for unknown actions', () => {
    const action = {type: 'UNKNOWN_ACTION'} as unknown as WorkshopAction;
    const newState = workshopReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });
});
