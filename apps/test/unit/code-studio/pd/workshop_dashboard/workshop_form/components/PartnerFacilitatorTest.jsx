import {render} from '@testing-library/react';
import React, {useReducer} from 'react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {workshopReducer} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_form/reducers/workshopReducer';
import {PartnerFacilitator} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_form/sections/PartnerFacilitator';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {useFetch} from '@cdo/apps/util/useFetch';

jest.mock('@cdo/apps/util/useFetch');

const mockedUseFetch = useFetch;

const initialWorkshopState = {
  facilitators: [],
  regionalPartnerId: null,
  organizerId: null,
  courseOfferings: [],
};

const byoCourseName = 'Build Your Own Workshop';

const config = WorkshopCourseConfigs.find(c => c.label === byoCourseName);
const errors = {};

const PartnerFacilitatorWithState = (props = {}) => {
  const [state, dispatch] = useReducer(workshopReducer, initialWorkshopState);
  return (
    <PartnerFacilitator
      config={config}
      errors={errors}
      dispatchWorkshop={dispatch}
      {...state}
      {...props}
    />
  );
};

PartnerFacilitatorWithState.propTypes = {};

describe('PartnerFacilitator', () => {
  beforeEach(() => {
    mockedUseFetch.mockImplementation(url => {
      if (url.includes('course_offerings')) {
        return {
          data: [
            {id: 1, name: 'Facilitator 1', email: 'fac1@example.com'},
            {id: 2, name: 'Facilitator 2', email: 'fac2@example.com'},
          ],
          loading: false,
          error: null,
        };
      }
      if (url.includes('potential_organizers')) {
        return {
          data: [
            {value: 1, label: 'Organizer 1'},
            {value: 2, label: 'Organizer 2'},
          ],
          loading: false,
          error: null,
        };
      }
      return {data: null, loading: false, error: null};
    });
  });

  describe('Potential organizers', () => {
    it('fetches potential organizers for the workshop', async () => {
      render(
        <MemoryRouter initialEntries={['/123']}>
          <Routes>
            <Route
              path="/:workshopId"
              element={<PartnerFacilitatorWithState />}
            />
          </Routes>
        </MemoryRouter>
      );
      expect(mockedUseFetch).toHaveBeenCalledWith(
        `/api/v1/pd/workshops/123/potential_organizers`
      );
    });
  });

  describe('Facilitators', () => {
    it('fetches course facilitators for the course', async () => {
      const nonByoConfig = WorkshopCourseConfigs.find(
        c => c.label !== byoCourseName
      );
      render(<PartnerFacilitatorWithState config={nonByoConfig} />);
      expect(mockedUseFetch).toHaveBeenCalledWith(
        `/api/v1/pd/course_facilitators?course=${encodeURIComponent(
          nonByoConfig.label
        )}`
      );
    });

    it('fetches all course facilitators for byo workshop course', async () => {
      render(<PartnerFacilitatorWithState />);
      expect(mockedUseFetch).toHaveBeenCalledWith(
        `/api/v1/pd/course_facilitators`
      );
    });

    it('fetches course facilitators for the course_offerings', async () => {
      render(<PartnerFacilitatorWithState courseOfferings={['1', '2']} />);
      expect(mockedUseFetch).toHaveBeenCalledWith(
        `/api/v1/pd/course_facilitators?course_offerings=1&course_offerings=2`
      );
    });
  });

  describe('Regional partners', () => {
    it('fetches regional partners', async () => {
      render(<PartnerFacilitatorWithState />);
      expect(mockedUseFetch).toHaveBeenCalledWith('/api/v1/regional_partners');
    });
  });
});
