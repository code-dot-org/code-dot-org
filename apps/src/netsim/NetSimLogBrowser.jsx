/** @file Modal dialog for browsing any logs in the simulation. */
import PropTypes from 'prop-types';
import React from 'react';

import Dialog, {Title, Body} from '../legacySharedComponents/Dialog';

import NetSimLogBrowserFilters from './NetSimLogBrowserFilters';
import NetSimLogBrowserTable from './NetSimLogBrowserTable';

// We want the table to scroll beyond this height
const MAX_TABLE_HEIGHT = 500;

const style = {
  scrollArea: {
    maxHeight: MAX_TABLE_HEIGHT,
    overflowY: 'auto',
  },
};

export default class NetSimLogBrowser extends React.Component {
  static propTypes = {
    ...Dialog.propTypes,
    i18n: PropTypes.objectOf(PropTypes.func).isRequired,
    canSetRouterLogMode: PropTypes.bool,
    isAllRouterLogMode: PropTypes.bool,
    setRouterLogMode: PropTypes.func.isRequired,
    localAddress: PropTypes.string,
    currentTrafficFilter: PropTypes.string.isRequired,
    setTrafficFilter: PropTypes.func.isRequired,
    headerFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    logRows: PropTypes.arrayOf(PropTypes.object).isRequired,
    senderNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    renderedRowLimit: PropTypes.number,
    teacherView: PropTypes.bool,
  };

  static defaultProps = {
    isAllRouterLogMode: true,
    currentTrafficFilter: 'none',
  };

  dialogTitle() {
    const {i18n, teacherView, isAllRouterLogMode, currentTrafficFilter} =
      this.props;
    if (teacherView) {
      return i18n.logBrowserHeader_teacherView();
    }

    let header = isAllRouterLogMode
      ? i18n.logBrowserHeader_all()
      : i18n.logBrowserHeader_mine();

    const match = /^(from|to|with) ([\d\.]+)/.exec(currentTrafficFilter);
    if (match) {
      if ('from' === match[1]) {
        header += i18n.logBrowserHeader_trafficFromAddress({
          address: match[2],
        });
      } else if ('to' === match[1]) {
        header += i18n.logBrowserHeader_trafficToAddress({
          address: match[2],
        });
      } else if ('with' === match[1]) {
        header += i18n.logBrowserHeader_trafficToAndFromAddress({
          address: match[2],
        });
      }
    }
    return header;
  }

  state = {currentSentByFilter: 'none'};

  setSentByFilter = currentSentByFilter => this.setState({currentSentByFilter});

  render() {
    return (
      <Dialog fullWidth {...this.props}>
        <Title>{this.dialogTitle()}</Title>
        <Body>
          <NetSimLogBrowserFilters
            i18n={this.props.i18n}
            canSetRouterLogMode={this.props.canSetRouterLogMode}
            isAllRouterLogMode={this.props.isAllRouterLogMode}
            setRouterLogMode={this.props.setRouterLogMode}
            localAddress={this.props.localAddress}
            currentTrafficFilter={this.props.currentTrafficFilter}
            setTrafficFilter={this.props.setTrafficFilter}
            currentSentByFilter={this.state.currentSentByFilter}
            setSentByFilter={this.setSentByFilter}
            teacherView={this.props.teacherView}
            senderNames={this.props.senderNames}
          />
          <div style={style.scrollArea}>
            {/* TODO: get table sticky headers working */}
            <NetSimLogBrowserTable
              headerFields={this.props.headerFields}
              logRows={this.props.logRows}
              renderedRowLimit={this.props.renderedRowLimit}
              teacherView={this.props.teacherView}
              currentSentByFilter={this.state.currentSentByFilter}
            />
          </div>
        </Body>
      </Dialog>
    );
  }
}
