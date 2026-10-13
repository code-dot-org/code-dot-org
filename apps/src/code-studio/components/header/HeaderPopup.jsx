import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import progress from '../../progress';
import MiniView from '../progress/MiniView';

import styles from './header-popup.module.scss';

/** The lesson menu: every lesson in the unit with its bubbles. */
export const HeaderPopupPanel = React.forwardRef(
  ({scriptData, minimal, windowHeight}, ref) => (
    <div className="header_popup" ref={ref}>
      <div
        className="header_popup_scrollable"
        style={{maxHeight: windowHeight - 80}}
      >
        <div className="header_popup_body">
          <div className="user-stats-block">
            <MiniView
              minimal={minimal}
              courseName={scriptData?.course_name}
              unitPosition={scriptData?.unit_position}
            />
          </div>
        </div>
      </div>
    </div>
  )
);
HeaderPopupPanel.displayName = 'HeaderPopupPanel';
HeaderPopupPanel.propTypes = {
  scriptData: PropTypes.object,
  minimal: PropTypes.bool,
  windowHeight: PropTypes.number,
};

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

  popupRef = React.createRef();

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

    $(document).on('click', this.handleClickDocument);
  };

  handleClickClose = () => {
    this.setState({open: false});

    $(document).off('click', this.handleClickDocument);
  };

  handleClickDocument = event => {
    const target = event && event.target;
    if (this.popupRef.current?.contains(target)) {
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
            <i className={classNames('fa-solid fa-caret-down', styles.caret)} />
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
              <i className={classNames('fa-solid fa-caret-up', styles.caret)} />
              <div className={styles.more}>{i18n.lessAllCaps()}</div>
            </button>

            <HeaderPopupPanel
              ref={this.popupRef}
              scriptData={this.props.scriptData}
              minimal={this.props.minimal}
              windowHeight={this.props.windowHeight}
            />
          </div>
        )}
      </div>
    );
  }
}
