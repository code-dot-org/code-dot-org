/** @file Modal dialog for browsing any logs in the simulation. */
import React from 'react';
import Dialog, {Title, Body} from '../templates/Dialog';
import NetSimLogBrowserFilters from './NetSimLogBrowserFilters';
import NetSimLogBrowserTable from './NetSimLogBrowserTable';

// We want the table to scroll beyond this height
const MAX_TABLE_HEIGHT = 500;

const style = {
  scrollArea: {
    maxHeight: MAX_TABLE_HEIGHT,
    overflowY: 'auto'
  }
};

const NetSimLogBrowser = React.createClass({
  propTypes: Object.assign({}, Dialog.propTypes, {
    i18n: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    canSetRouterLogMode: React.PropTypes.bool,
    isAllRouterLogMode: React.PropTypes.bool,
    setRouterLogMode: React.PropTypes.func.isRequired,
    localAddress: React.PropTypes.string,
    currentTrafficFilter: React.PropTypes.string.isRequired,
    setTrafficFilter: React.PropTypes.func.isRequired,
    headerFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    logRows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    senderNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    renderedRowLimit: React.PropTypes.number,
    teacherView: React.PropTypes.bool
  }),

  getDefaultProps() {
    return {
      isAllRouterLogMode: true,
      currentTrafficFilter: 'none'
    };
  },

  dialogTitle() {
    const {i18n, teacherView, isAllRouterLogMode, currentTrafficFilter} = this.props;
    if (teacherView) {
      return i18n.logBrowserHeader_teacherView();
    }

    let header = isAllRouterLogMode ?
      i18n.logBrowserHeader_all() : i18n.logBrowserHeader_mine();

    const match = /^(from|to|with) ([\d\.]+)/.exec(currentTrafficFilter);
    if (match) {
      if ('from' === match[1]) {
        header += i18n.logBrowserHeader_trafficFromAddress({
          address: match[2]
        });
      } else if ('to' === match[1]) {
        header += i18n.logBrowserHeader_trafficToAddress({
          address: match[2]
        });
      } else if ('with' === match[1]) {
        header += i18n.logBrowserHeader_trafficToAndFromAddress({
          address: match[2]
        });
      }
    }
    return header;
  },

  getInitialState() {
    return {
      currentSentByFilter: 'none'
    };
  },

  setSentByFilter(newFilter) {
    this.setState({ currentSentByFilter: newFilter});
  },

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
});
export default NetSimLogBrowser;
