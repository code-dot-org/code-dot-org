import {Tour} from 'shepherd.js';

import {
  createHomepageSteps,
  getLoginSelector,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/createSectionOnboarding';

describe('getLoginSelector', () => {
  it('returns email login for exclusively high school grades', () => {
    expect(getLoginSelector(['9', '10', '11', '12'])).toBe(
      '.uitest-emailLogin'
    );
    expect(getLoginSelector(['9'])).toBe('.uitest-emailLogin');
    expect(getLoginSelector(['11', '12'])).toBe('.uitest-emailLogin');
  });

  it('returns picture login for exclusively elementary grades', () => {
    expect(getLoginSelector(['K', '1', '2', '3', '4', '5'])).toBe(
      '.uitest-pictureLogin'
    );
    expect(getLoginSelector(['K'])).toBe('.uitest-pictureLogin');
    expect(getLoginSelector(['2', '4'])).toBe('.uitest-pictureLogin');
  });

  it('returns word login for exclusively middle school grades', () => {
    expect(getLoginSelector(['6', '7', '8'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['7'])).toBe('.uitest-wordLogin');
  });

  it('returns word login for grades spanning multiple buckets', () => {
    expect(getLoginSelector(['9', '5', '2'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['9', '6'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['K', '8'])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(['3', '10'])).toBe('.uitest-wordLogin');
  });

  it('returns word login for empty or missing grade data', () => {
    expect(getLoginSelector([])).toBe('.uitest-wordLogin');
    expect(getLoginSelector(null)).toBe('.uitest-wordLogin');
    expect(getLoginSelector(undefined)).toBe('.uitest-wordLogin');
  });
});

describe('createHomepageSteps — picture-login dialog dismissal', () => {
  let mockTour: {
    on: jest.Mock;
    cancel: jest.Mock;
    getCurrentStep: jest.Mock;
  };
  let loginEl: HTMLElement;

  beforeEach(() => {
    mockTour = {
      on: jest.fn(),
      cancel: jest.fn(),
      getCurrentStep: jest.fn().mockReturnValue({hide: jest.fn()}),
    };

    loginEl = document.createElement('button');
    loginEl.className = 'uitest-emailLogin';
    document.body.appendChild(loginEl);
  });

  afterEach(() => {
    loginEl.remove();
    jest.clearAllMocks();
  });

  type WhenHandlers = {show: () => void; hide: () => void};

  const getLoginStepWhen = (gradesTeaching: string[]): WhenHandlers => {
    const steps = createHomepageSteps(
      mockTour as unknown as Tour,
      gradesTeaching,
      'test-session-key'
    );
    const loginStep = steps.find(s => s.id === 'picture-login')!;
    return loginStep.when as unknown as WhenHandlers;
  };

  it('cancels the tour when the dialog is dismissed without a login type selection', async () => {
    const when = getLoginStepWhen(['9', '10', '11', '12']);
    when.show();

    document.body.removeChild(loginEl);
    await Promise.resolve();

    expect(mockTour.cancel).toHaveBeenCalled();
  });

  it('does not cancel the tour when a login type is clicked before the dialog closes', async () => {
    const when = getLoginStepWhen(['9', '10', '11', '12']);
    when.show();

    loginEl.click();

    document.body.removeChild(loginEl);
    await Promise.resolve();

    expect(mockTour.cancel).not.toHaveBeenCalled();
  });

  it('cleans up the observer when the step is hidden', async () => {
    const when = getLoginStepWhen(['9', '10', '11', '12']);
    when.show();
    when.hide();

    document.body.removeChild(loginEl);
    await Promise.resolve();

    expect(mockTour.cancel).not.toHaveBeenCalled();
  });
});
