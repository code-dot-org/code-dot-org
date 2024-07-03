import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import HideToolbarHelper from '@cdo/apps/templates/HideToolbarHelper';

describe('HideToolbarHelper', function () {
  it('shows the hide toolbar helper', function () {
    const component = shallow(<HideToolbarHelper />);

    const instance = component.instance();

    jest.spyOn(instance, 'isCompatibleiOS').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isHideCookieSet').mockClear().mockReturnValue(false);
    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isToolbarShowing').mockClear().mockReturnValue(true);

    instance.updateLayout();

    expect(instance.state.showHelper).toBe(true);
  });

  it('does not show the hide toolbar helper', function () {
    const component = shallow(<HideToolbarHelper />);

    const instance = component.instance();

    jest.spyOn(instance, 'isCompatibleiOS').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isHideCookieSet').mockClear().mockReturnValue(false);
    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isToolbarShowing').mockClear().mockReturnValue(false);

    instance.updateLayout();

    expect(instance.state.showHelper).toBe(false);
  });

  it('we set a cookie when the toolbar goes away', function () {
    const component = shallow(<HideToolbarHelper />);

    const instance = component.instance();

    const setHideHelperCookie = jest
      .spyOn(instance, 'setHideHelperCookie')
      .mockClear()
      .mockImplementation();

    jest.spyOn(instance, 'isCompatibleiOS').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isHideCookieSet').mockClear().mockReturnValue(false);
    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    const isToolbarShowing = jest
      .spyOn(instance, 'isToolbarShowing')
      .mockClear()
      .mockReturnValue(true);

    instance.updateLayout();

    expect(instance.state.showHelper).toBe(true);
    expect(setHideHelperCookie).not.toHaveBeenCalled();

    isToolbarShowing.mockRestore();
    jest.spyOn(instance, 'isToolbarShowing').mockClear().mockReturnValue(false);

    instance.updateLayout();

    expect(instance.state.showHelper).toBe(false);
    expect(setHideHelperCookie).toHaveBeenCalled();
  });
});
