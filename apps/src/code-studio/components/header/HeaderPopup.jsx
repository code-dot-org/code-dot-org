import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import progress from '../../progress';
import MiniView from '../progress/MiniView';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';

export default class HeaderPopup extends Component {
  static propTypes = {
    scriptName: PropTypes.string,
    scriptData: PropTypes.object,
    currentLevelId: PropTypes.string,
    linesOfCodeText: PropTypes.string,
    minimal: PropTypes.bool,
    windowHeight: PropTypes.number
  };

  state = {
    open: false
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.windowHeight !== nextProps.windowHeight ||
      this.props.minimal !== nextProps.minimal ||
      this.state.open !== nextState.open
    );
  }

  handleClickOpen = () => {
    this.setState({open: true});

    progress.retrieveProgress(
      this.props.scriptName,
      this.props.scriptData,
      this.props.currentLevelId
    );

    firehoseClient.putRecord(
      {
        study: 'mini_view',
        event: 'mini_view_opened',
        data_json: JSON.stringify({
          current_level_id: this.props.currentLevelId
        })
      },
      {includeUserId: true}
    );

    $(document).on('click', this.handleClickDocument);
  };

  handleClickClose = () => {
    this.setState({open: false});

    $(document).off('click', this.handleClickDocument);
  };

  handleClickDocument = event => {
    const target = event && event.target;
    if ($(this.refs.headerPopup).find(target).length > 0) {
      return;
    }

    this.handleClickClose();
  };

  render() {
    return (
      <div style={styles.container}>
        {!this.state.open && (
          <div
            style={styles.headerItem}
            className="header_popup_link"
            onClick={this.handleClickOpen}
          >
            <i className="fa fa-caret-down" style={styles.caret} />
            <div style={styles.more}>{i18n.moreAllCaps()}</div>
          </div>
        )}

        {this.state.open && (
          <div>
            <div style={styles.headerItem} onClick={this.handleClickClose}>
              <i className="fa fa-caret-up" style={styles.caret} />
              <div style={styles.more}>{i18n.lessAllCaps()}</div>
            </div>

            <div className="header_popup" ref="headerPopup">
              <div
                className="header_popup_scrollable"
                style={{maxHeight: this.props.windowHeight - 80}}
              >
                <div className="header_popup_body">
                  <div className="user-stats-block">
                    <MiniView
                      linesOfCodeText={this.props.linesOfCodeText}
                      minimal={this.props.minimal}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  headerItem: {
    textAlign: 'center',
    cursor: 'pointer'
  },
  caret: {
    fontSize: 40,
    color: color.orange,
    lineHeight: '10px'
  },
  more: {
    fontSize: 10,
    lineHeight: '10px'
  }
};
