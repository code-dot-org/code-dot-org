import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import FixZoomHelper from '@cdo/apps/templates/FixZoomHelper';

describe('FixZoomHelper', function () {
  it('shows nothing when not zoomed', function () {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isZoomed').mockClear().mockReturnValue(false);
    instance.updateViewport();

    expect(instance.state.mode).toBe('none');
  });

  it('shows button when zoomed', function () {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isZoomed').mockClear().mockReturnValue(true);
    instance.updateViewport();

    expect(instance.state.mode).toBe('button');
  });

  it('shows helper when zoomed and button pressed', function () {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isZoomed').mockClear().mockReturnValue(true);
    instance.updateViewport();

    instance.onButtonClick();

    expect(instance.state.mode).toBe('helper');
  });

  it('shows button again when zoomed and helper pressed', function () {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    jest.spyOn(instance, 'isZoomed').mockClear().mockReturnValue(true);
    instance.updateViewport();

    instance.onButtonClick();

    expect(instance.state.mode).toBe('helper');

    instance.onHelperClick();

    expect(instance.state.mode).toBe('button');
  });

  it('shows nothing when zoomed and button pressed and zoomed back out', function () {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    jest.spyOn(instance, 'isLandscape').mockClear().mockReturnValue(true);
    const isZoomedStub = jest
      .spyOn(instance, 'isZoomed')
      .mockClear()
      .mockImplementation();
    isZoomedStub.mockReturnValue(true);
    instance.updateViewport();

    instance.onButtonClick();

    expect(instance.state.mode).toBe('helper');

    isZoomedStub.mockReturnValue(false);
    instance.updateViewport();

    expect(instance.state.mode).toBe('none');
  });
});
