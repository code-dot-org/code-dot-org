import {
  tourListSteps,
  tourSteps,
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
    const steps = tourSteps(false);
    expect(steps[0]).toMatchObject({id: 'welcome', view: 'blank'});
    expect(tourListSteps(steps)).toEqual(steps.slice(1));
  });

  it('with a scene menu, keeps the menu up for both scene lines', () => {
    const [, scenes, gallery] = tourSteps(false);
    expect(scenes.view).toBe('scene-menu');
    expect(scenes.target?.direction).toBe('right');
    expect(gallery.view).toBe('scene-menu');
    expect(gallery.target).toMatchObject({
      selector: '#scene-menu-manage',
      direction: 'left',
    });
  });

  it('with a gallery chip, shows the gallery for the second scene line', () => {
    const [, scenes, gallery] = tourSteps(true);
    expect(scenes.view).toBe('blank');
    expect(scenes.target?.selector).toBe('#scene-dropdown-button');
    expect(gallery.view).toBe('gallery');
    expect(gallery.target).toMatchObject({
      selector: '[data-scene-card]',
      direction: 'left',
    });
  });

  it('shares the lines after the scene ones', () => {
    expect(tourSteps(true).slice(3)).toEqual(tourSteps(false).slice(3));
  });
});
