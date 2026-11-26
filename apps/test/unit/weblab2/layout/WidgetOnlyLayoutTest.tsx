import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import WidgetOnlyLayout from '@cdo/apps/weblab2/layout/WidgetOnlyLayout';

const levelProperties = {id: 7, name: 'widget', appName: 'weblab2'};
jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: () => ({levelProperties}),
}));
jest.mock('@cdo/apps/weblab2/htmlPreview/HTMLPreview', () => ({
  HTMLPreview: () => <div>the preview</div>,
}));
jest.mock('@codebridge/hooks/useCodebridgeSettings', () => ({
  useCodebridgeSettings: () => ['a setting'],
}));
const mockResourcePanel = jest.fn((props: unknown) => <div>the rail</div>);
jest.mock('@cdo/apps/lab2/views/components/Instructions/ResourcePanel', () => ({
  __esModule: true,
  default: (props: unknown) => mockResourcePanel(props),
}));
const mockNavigationArea = jest.fn((props: unknown) => <div>navigation</div>);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/NavigationArea',
  () => ({
    __esModule: true,
    default: (props: unknown) => mockNavigationArea(props),
  })
);

describe('WidgetOnlyLayout', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab2System: () => ({isRunning: false, hasRun: true}),
      lab2Project: () => ({hasEdited: false}),
    });
  });
  afterEach(() => restoreRedux());

  it("shows the resource panel's rail, the preview and the plain Continue under it", () => {
    render(
      <Provider store={getStore()}>
        <WidgetOnlyLayout />
      </Provider>
    );

    expect(screen.getByText('the rail')).toBeInTheDocument();
    expect(mockResourcePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        sidebarOnly: true,
        levelProperties,
        settings: ['a setting'],
      })
    );
    expect(screen.getByText('the preview')).toBeInTheDocument();
    expect(screen.getByText('navigation')).toBeInTheDocument();
    expect(mockNavigationArea).toHaveBeenCalledWith(
      expect.objectContaining({
        levelProperties,
        textVariant: 'simple',
        continueButtonSize: 'medium',
        isRunning: false,
        hasRun: true,
        hasEdited: false,
      })
    );
  });
});
