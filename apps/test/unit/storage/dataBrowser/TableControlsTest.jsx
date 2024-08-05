import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import {reducers} from '@cdo/apps/applab/redux/applab';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {ChartType} from '@cdo/apps/storage/dataBrowser/dataUtils';
import VisualizerModal, {
  INITIAL_STATE as VISUALIZER_MODAL_INITIAL_STATE,
} from '@cdo/apps/storage/dataBrowser/dataVisualizer/VisualizerModal';
import TableControls from '@cdo/apps/storage/dataBrowser/TableControls';
import {changeView} from '@cdo/apps/storage/redux/data';
import experiments from '@cdo/apps/util/experiments';
import commonI18n from '@cdo/locale';

const DEFAULT_PROPS = {
  isRtl: false,
  clearTable: () => {},
  exportCsv: () => {},
  importCsv: () => {},
  tableName: 'tableName',
  readOnly: false,
};

describe('TableControls', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({...commonReducers, ...reducers, isRtl});
    experiments.setEnabled(experiments.APPLAB_DATASETS, true);
    const store = getStore();
    store.dispatch(changeView(DataView.TABLE), 'tableName');
  });

  afterEach(() => {
    restoreRedux();
    experiments.setEnabled(experiments.APPLAB_DATASETS, false);
  });

  it('VisualizerModal state resets when tableName changes', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <TableControls {...DEFAULT_PROPS} />
      </Provider>
    );
    setModalState(wrapper, {
      chartType: ChartType.BAR_CHART,
      selectedColumn1: 'column',
    });
    assertModalState(wrapper, {
      ...VISUALIZER_MODAL_INITIAL_STATE,
      chartType: ChartType.BAR_CHART,
      selectedColumn1: 'column',
    });
    setModalProps(wrapper, {
      tableName: 'differentTable',
    });
    assertModalState(wrapper, VISUALIZER_MODAL_INITIAL_STATE);
  });

  function getModal(wrapper) {
    return wrapper.find(VisualizerModal).children().first();
  }

  function assertModalState(wrapper, expectedState) {
    expect(getModal(wrapper).state()).toEqual(expectedState);
  }

  function setModalState(wrapper, newState) {
    React.act(() => {
      getModal(wrapper).setState(newState);
    });
  }

  function setModalProps(wrapper, newProps) {
    wrapper.setProps({
      children: React.cloneElement(wrapper.props().children, newProps),
    });
  }

  describe('localization', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render a localized string for "Clear Table"', () => {
      jest
        .spyOn(commonI18n, 'clearTable')
        .mockClear()
        .mockReturnValue('i18n-clear-table');

      const store = getStore();
      const wrapper = mount(
        <Provider store={store}>
          <TableControls {...DEFAULT_PROPS} />
        </Provider>
      );

      let clearButton = wrapper.find('ConfirmDeleteButton');
      expect(clearButton.text()).toContain('i18n-clear-table');
      expect(clearButton.prop('title')).toContain('i18n-clear-table');
    });
  });
});
