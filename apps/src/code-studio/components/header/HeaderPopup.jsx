import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
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
    return (
      <div>
        {!this.state.open && (
          <MuiIconButton
            type="button"
            className={`no-mc header_popup_link ${styles.headerItem}`}
            onClick={this.handleClickOpen}
            variant="outlined"
            color="tertiary"
            size="small"
            aria-label={i18n.moreAllCaps()}
          >
            <FontAwesomeV6Icon iconName="down-from-dotted-line" />
          </MuiIconButton>
        )}

        {this.state.open && (
          <div>
            <MuiIconButton
              type="button"
              className={`no-mc ${styles.headerItem}`}
              onClick={this.handleClickClose}
              variant="outlined"
              color="tertiary"
              size="small"
              aria-label={i18n.lessAllCaps()}
            >
              <FontAwesomeV6Icon iconName="up-from-dotted-line" />
            </MuiIconButton>

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
