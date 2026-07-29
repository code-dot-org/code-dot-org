import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';
import styleConstants from '@cdo/apps/styleConstants';
import msg from '@cdo/locale';

import SettingsCog from '../code-studio/components/SettingsCog';
import PaneHeader, {PaneButton, PaneSection} from '../templates/PaneHeader';
import ProjectTemplateWorkspaceIcon from '../templates/ProjectTemplateWorkspaceIconV2';
import color from '../util/color';

export default class DesignModeHeaders extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    onToggleToolbox: PropTypes.func.isRequired,
    isToolboxVisible: PropTypes.bool.isRequired,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    showMakerToggle: PropTypes.bool.isRequired,
    autogenerateML: PropTypes.func,
  };

  onToggleToolbox = () => this.props.onToggleToolbox();

  chevronStyle(collapse) {
    const style = {
      display: 'inline-block',
      position: 'absolute',
      padding: 0,
      margin: 0,
      top: 0,
      left: this.props.isRtl ? '' : 8,
      right: this.props.isRtl ? 8 : '',
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      lineHeight: styleConstants['workspace-headers-height'] + 'px',
      fontSize: 18,
      cursor: 'pointer',
      color: color.neutral_white,
      ':hover': {
        color: color.neutral_dark20,
      },
    };

    if (collapse) {
      style.transform = 'scale(-1, 1)';
    }

    return style;
  }

  hideToolboxIcon() {
    return (
      <MuiIconButton
        type="button"
        variant="outlined"
        color="secondary"
        size="extraSmall"
        aria-label="Hide the toolbox"
        className="hide-toolbox-icon"
        onClick={this.onToggleToolbox}
        sx={{
          borderRadius: '50%',
          height: '1rem',
          width: '1rem',
        }}
      >
        <FontAwesomeV6Icon iconName="chevron-left" iconStyle="solid" />
      </MuiIconButton>
    );
  }

  showToolboxIcon() {
    return (
      <MuiIconButton
        type="button"
        variant="outlined"
        color="secondary"
        size="extraSmall"
        aria-label="Show the toolbox"
        className="show-toolbox-icon"
        onClick={this.onToggleToolbox}
        sx={{
          borderRadius: '50%',
          height: '1rem',
          width: '1rem',
        }}
      >
        <FontAwesomeV6Icon iconName="chevron-right" iconStyle="solid" />
      </MuiIconButton>
    );
  }

  render() {
    const styles = {
      toolboxHeader: {
        display: this.props.isToolboxVisible ? 'flex' : 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 271,
        borderLeft: this.props.isRtl
          ? '1px solid var(--borders-neutral-strong)'
          : '',
        borderRight: this.props.isRtl
          ? ''
          : '1px solid var(--borders-neutral-strong)',
        paddingLeft: '.5rem',
        paddingRight: '.5rem',
        boxSizing: 'border-box',
        gap: '.5rem',
      },
      showToolboxHeader: {
        display: this.props.isToolboxVisible ? 'none' : 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '.5rem',
        paddingRight: '.5rem',
        boxSizing: 'border-box',
        gap: '.5rem',
      },
      showToolboxClickable: {
        marginLeft: this.props.isRtl ? '' : 18,
        marginRight: this.props.isRtl ? 18 : '',
        ':hover': {
          color: color.white,
        },
      },
      iconContainer: {
        float: this.props.isRtl ? 'left' : 'right',
        marginRight: 10,
        marginLeft: 10,
        height: '100%',
      },
      assetsIcon: {
        fontSize: 18,
        verticalAlign: 'middle',
      },
      runningVersionHistoryButton: {
        color: color.dark_charcoal,
      },
    };

    const hasFocus = !this.props.isRunning;

    const settingsCog = (
      <SettingsCog
        isRunning={this.props.isRunning}
        showMakerToggle={this.props.showMakerToggle}
        runModeIndicators
        autogenerateML={this.props.autogenerateML}
      />
    );

    return (
      <PaneHeader
        id="design-headers"
        dir={this.props.isRtl ? 'rtl' : 'ltr'}
        style={{color: 'white'}}
      >
        <PaneSection
          id="design-toolbox-header"
          className={classNames(
            'workspace-header',
            this.props.isRunning && 'is-running'
          )}
          style={styles.toolboxHeader}
        >
          <span>{this.hideToolboxIcon()}</span>
          <MuiTypography
            variant="body4"
            sx={{
              color: 'var(--text-neutral-white-fixed)',
            }}
          >
            {applabMsg.designToolboxHeader()}
          </MuiTypography>
          <span>{settingsCog}</span>
        </PaneSection>
        <PaneSection
          className={classNames(
            'workspace-header',
            this.props.isRunning && 'is-running'
          )}
          style={styles.showToolboxHeader}
        >
          {this.showToolboxIcon()}
          <span>{msg.showToolbox()}</span>
          <span>{settingsCog}</span>
        </PaneSection>
        <PaneSection
          id="design-workspace-header"
          className={classNames(
            'workspace-header',
            this.props.isRunning && 'is-running'
          )}
          style={{
            alignItems: 'center',
            flex: '1 1 0',
            gap: '0.5rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {this.props.showProjectTemplateWorkspaceIcon && (
            <ProjectTemplateWorkspaceIcon tooltipPlace="onTop" />
          )}
          <MuiTypography
            variant="body4"
            id="workspace-header-span"
            sx={{
              color: 'var(--text-neutral-white-fixed)',
            }}
          >
            {applabMsg.designWorkspaceHeader()}
          </MuiTypography>
        </PaneSection>
        <PaneButton
          id="design-mode-versions-header"
          style={this.props.isRunning ? styles.runningVersionHistoryButton : {}}
          iconProps={{iconName: 'clock', iconStyle: 'regular'}}
          label={msg.showVersionsHeader()}
          headerHasFocus={hasFocus}
          isRtl={this.props.isRtl}
          onClick={this.props.handleVersionHistory}
        />
      </PaneHeader>
    );
  }
}
