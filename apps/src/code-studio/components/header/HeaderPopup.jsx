import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

import progress from '../../progress';
import MiniView from '../progress/MiniView';

import styles from './header-popup.module.scss';

export default class HeaderPopup extends Component {
  static propTypes = {
    scriptName: PropTypes.string,
    scriptData: PropTypes.object,
    currentLevelId: PropTypes.string,
    minimal: PropTypes.bool,
    windowHeight: PropTypes.number,
  };

  state = {
    open: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.windowHeight !== nextProps.windowHeight ||
      this.props.minimal !== nextProps.minimal ||
      this.state.open !== nextState.open
    );
  }

  handleClickOpen = e => {
    e.stopPropagation();
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
          current_level_id: this.props.currentLevelId,
        }),
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
      <div>
        {!this.state.open && (
          <button
            type="button"
            className={classNames(
              'no-mc',
              'header_popup_link',
              styles.headerItem
            )}
            onClick={this.handleClickOpen}
          >
            <i className={classNames('fa fa-caret-down', styles.caret)} />
            <div className={styles.more}>{i18n.moreAllCaps()}</div>
          </button>
        )}

        {this.state.open && (
          <div>
            <button
              type="button"
              className={classNames(
                'no-mc',
                styles.headerItem,
                styles.headerItemLess
              )}
              onClick={this.handleClickClose}
            >
              <i className={classNames('fa fa-caret-up', styles.caret)} />
              <div className={styles.more}>{i18n.lessAllCaps()}</div>
            </button>

            <div className="header_popup" ref="headerPopup">
              <div
                className="header_popup_scrollable"
                style={{maxHeight: this.props.windowHeight - 80}}
              >
                <div className="header_popup_body">
                  <div className="user-stats-block">
                    <MiniView minimal={this.props.minimal} />
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
