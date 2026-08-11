import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

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

    $(document).on('click', this.handleClickDocument);
  };

  handleClickClose = () => {
    this.setState({open: false});

    $(document).off('click', this.handleClickDocument);
  };

  handleClickToggle = event => {
    if (this.state.open) {
      event.stopPropagation();
      this.handleClickClose();
    } else {
      this.handleClickOpen(event);
    }
  };

  handleClickDocument = event => {
    const target = event && event.target;
    if ($(this.refs.headerPopup).find(target).length > 0) {
      return;
    }

    this.handleClickClose();
  };

  render() {
    const scriptData = this.props.scriptData;
    const courseName = scriptData?.course_name;
    const unitPosition = scriptData?.unit_position;
    const toggleLabel = this.state.open ? i18n.less() : i18n.more();
    return (
      <div>
        <WithTooltip
          tooltipProps={{
            text: toggleLabel,
            tooltipId: 'header-popup-toggle-tooltip',
            size: 's',
            direction: 'onRight',
          }}
        >
          <MuiIconButton
            type="button"
            className={classNames(
              'no-mc',
              'header_popup_link',
              styles.headerItem,
              this.state.open && styles.headerItemPressed
            )}
            onClick={this.handleClickToggle}
            variant="text"
            color="white"
            size="small"
            aria-label={toggleLabel}
            aria-pressed={this.state.open}
          >
            <FontAwesomeV6Icon
              iconName="down-from-dotted-line"
              aria-hidden="true"
            />
          </MuiIconButton>
        </WithTooltip>

        {this.state.open && (
          <div>
            <div className="header_popup" ref="headerPopup">
              <div
                className="header_popup_scrollable"
                style={{maxHeight: this.props.windowHeight - 80}}
              >
                <div className="header_popup_body">
                  <div className="user-stats-block">
                    <MiniView
                      minimal={this.props.minimal}
                      courseName={courseName}
                      unitPosition={unitPosition}
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
