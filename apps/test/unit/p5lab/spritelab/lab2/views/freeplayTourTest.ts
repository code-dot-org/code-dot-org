import {
  TOUR_LIST_STEPS,
  TOUR_STEPS,
  tourVariantFromParams,
} from '@cdo/apps/p5lab/spritelab/lab2/views/freeplayTour';

const mockQueryParams = jest.fn();
jest.mock('@cdo/apps/code-studio/utils', () => ({
  queryParams: (key: string) => mockQueryParams(key),
}));

describe('freeplayTour', () => {
  afterEach(() => mockQueryParams.mockReset());

  it('reads the variant from ?tour=', () => {
    mockQueryParams.mockReturnValue('steps');
    expect(tourVariantFromParams()).toBe('steps');
    expect(mockQueryParams).toHaveBeenCalledWith('tour');

    mockQueryParams.mockReturnValue('list');
    expect(tourVariantFromParams()).toBe('list');
  });

  it('runs no tour for a missing or unknown value', () => {
    mockQueryParams.mockReturnValue(undefined);
    expect(tourVariantFromParams()).toBeUndefined();

    mockQueryParams.mockReturnValue('yes');
    expect(tourVariantFromParams()).toBeUndefined();
  });

  it('lists every step but the welcome', () => {
    expect(TOUR_STEPS[0].view).toBe('blank');
    expect(TOUR_LIST_STEPS).toEqual(TOUR_STEPS.slice(1));
    expect(TOUR_LIST_STEPS.some(step => step.view === 'blank')).toBe(false);
  });
});
