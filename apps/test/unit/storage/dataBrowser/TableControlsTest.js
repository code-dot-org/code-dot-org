import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';

import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {reducers} from '@cdo/apps/applab/redux/applab';
import {changeView} from '@cdo/apps/storage/redux/data';
import experiments from '@cdo/apps/util/experiments';

import TableControls from '@cdo/apps/storage/dataBrowser/TableControls';
import VisualizerModal from '@cdo/apps/storage/dataBrowser/dataVisualizer/VisualizerModal';

const DEFAULT_PROPS = {
  clearTable: () => {},
  exportCsv: () => {},
  importCsv: () => {},
  tableName: 'tableName',
  readOnly: false
};

describe('TableControls', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({...commonReducers, ...reducers});
    experiments.setEnabled(experiments.APPLAB_DATASETS, true);
    const store = getStore();
    store.dispatch(changeView(DataView.TABLE), 'tableName');
  });

  afterEach(() => {
    restoreRedux();
    experiments.setEnabled(experiments.APPLAB_DATASETS, false);
  });

  it('creates a new VisualizerModal instance when tableName changes', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <TableControls {...DEFAULT_PROPS} />
      </Provider>
    );
    wrapper
      .find(VisualizerModal)
      .children()
      .first()
      .setState({chartType: 'Bar Chart', selectedColumn1: 'column'});
    expect(
      wrapper
        .find(VisualizerModal)
        .children()
        .first()
        .state().chartType
    ).to.equal('Bar Chart');
    wrapper.setProps({
      children: React.cloneElement(wrapper.props().children, {
        tableName: 'differentTable'
      })
    });
    expect(
      wrapper
        .find(VisualizerModal)
        .children()
        .first()
        .state().chartType
    ).to.equal('');
  });
});
