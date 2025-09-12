import {sessionsReducer} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/reducers/sessionsReducer';
import {
  SessionAction,
  SessionFormState,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';

describe('sessionsReducer', () => {
  const initialState: SessionFormState[] = [
    {
      id: '1',
      date: '2024-01-01',
      start: '09:00',
      end: '10:00',
      locationAddress: '',
      locationName: '',
      meetingLink: '',
      format: 'in_person',
    },
  ];

  it('should handle ADD_SESSION', () => {
    const action: SessionAction = {type: 'ADD_SESSION'};
    const newState = sessionsReducer(initialState, action);
    expect(newState.length).toEqual(2);
  });

  it('should handle UPDATE_SESSION', () => {
    const action: SessionAction = {
      type: 'UPDATE_SESSION',
      id: '1',
      payload: {locationName: 'New Location'},
    };
    const newState = sessionsReducer(initialState, action);
    expect(newState[0].locationName).toEqual('New Location');
  });

  it('should handle DELETE_SESSION', () => {
    const action: SessionAction = {type: 'DELETE_SESSION', id: '1'};
    const newState = sessionsReducer(initialState, action);
    expect(newState.length).toEqual(0);
  });

  it('should handle SET_SESSIONS', () => {
    const newSessions: SessionFormState[] = [
      {
        id: '2',
        date: '2024-01-02',
        start: '11:00',
        end: '12:00',
        locationAddress: '',
        locationName: '',
        meetingLink: '',
        format: 'in_person',
      },
    ];
    const action: SessionAction = {type: 'SET_SESSIONS', payload: newSessions};
    const newState = sessionsReducer(initialState, action);
    expect(newState).toEqual(newSessions);
  });

  it('should return the current state for unknown actions', () => {
    const action = {type: 'UNKNOWN_ACTION'} as unknown as SessionAction;
    const newState = sessionsReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });
});
