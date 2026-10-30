import Alert from '@code-dot-org/component-library/alert';
import Checkbox from '@code-dot-org/component-library/checkbox';
import Link from '@code-dot-org/component-library/link';
import Tabs from '@code-dot-org/component-library/tabs';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import {CIPHER, ALPHABET} from '../../constants';

import {hideShareDialog, showLibraryCreationDialog} from './shareDialogRedux';

import moduleStyles from './advanced-share-options.module.scss';

const ShareOptions = {
  EXPORT: 'export',
  EMBED: 'embed',
  LIBRARY: 'library',
};

class AdvancedShareOptions extends React.Component {
  static propTypes = {
    shareUrl: PropTypes.string.isRequired,
    exportApp: PropTypes.func,
    librariesEnabled: PropTypes.bool,
    openLibraryCreationDialog: PropTypes.func.isRequired,
    onExpand: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    channelId: PropTypes.string.isRequired,
    embedOptions: PropTypes.shape({
      iframeHeight: PropTypes.number.isRequired,
      iframeWidth: PropTypes.number.isRequired,
    }).isRequired,
    appType: PropTypes.string.isRequired,
  };

  state = {
    exporting: false,
    exportError: null,
    embedWithoutCode: false,
  };

  downloadExport = () => {
    analyticsReporter.sendEvent(EVENTS.EXPORT_APP, {
      lab_type: this.props.appType,
    });
    this.setState({exporting: true});
    this.props
      .exportApp()
      .then(this.setState.bind(this, {exporting: false}), () => {
        this.setState({
          exporting: false,
          exportError: 'Failed to export project. Please try again later.',
        });
      });
  };

  renderEmbedTab() {
    let url = `${this.props.shareUrl}/embed`;
    if (this.state.embedWithoutCode) {
      // When embedding without code, we "hide" the real channel id for the
      // project by encoding it with a cipher. This is not meant to be secure,
      // it is just meant to make the bar slightly higher for people trying
      // to get to the original source.
      url =
        url.replace(
          this.props.channelId,
          this.props.channelId
            .split('')
            .map(char => CIPHER[ALPHABET.indexOf(char)] || char)
            .join('')
        ) + '?nosource';
    }
    const {iframeWidth, iframeHeight} = this.props.embedOptions;
    const iframeHtml = `<iframe width="${iframeWidth}" height="${iframeHeight}" style="border: 0px;" src="${url}"></iframe>`;
    return (
      <div className={moduleStyles.tabContent}>
        <MuiTypography variant="body3" className={moduleStyles.paragraph}>
          {i18n.shareEmbedDescription()}
        </MuiTypography>
        <MuiTypography
          variant="body3"
          className={moduleStyles.paragraph}
          style={{color: 'var(--text-error-primary)'}}
        >
          {i18n.shareEmbedWarning()}
        </MuiTypography>
        <textarea
          type="text"
          onClick={e => e.target.select()}
          readOnly={true}
          value={iframeHtml}
          className={moduleStyles.embedInput}
          aria-label={i18n.codeToEmbed()}
        />
        <Checkbox
          name="embedWithoutCode"
          label={i18n.hideAbilityToViewCode()}
          size="s"
          checked={this.state.embedWithoutCode}
          onChange={() =>
            this.setState({embedWithoutCode: !this.state.embedWithoutCode})
          }
        />
      </div>
    );
  }

  renderExportTab() {
    const alert = this.state.exportError ? (
      <Alert
        type="danger"
        text={this.state.exportError}
        onClose={() => this.setState({exportError: null})}
      />
    ) : null;

    const exportSupportLink =
      'https://support.code.org/hc/en-us/articles/13211665878157-Exporting-Projects-from-App-Lab';

    return (
      <div className={moduleStyles.tabContent}>
        <MuiTypography variant="body3" className={moduleStyles.paragraph}>
          Export your project as a zipped file, which will contain the
          HTML/CSS/JS files, as well as any assets, for your project. For
          instructions to run your exported project locally, see{' '}
          <Link
            href={exportSupportLink}
            text="our documentation"
            external
            openInNewTab
            size="s"
          />
          .
        </MuiTypography>
        <MuiButton
          variant="contained"
          color="secondary"
          size="medium"
          loading={this.state.exporting}
          onClick={this.downloadExport}
          type="button"
        >
          {i18n.exportForWeb()}
        </MuiButton>
        {alert}
      </div>
    );
  }

  renderLibraryTab = () => {
    return (
      <div className={moduleStyles.tabContent}>
        <MuiTypography variant="body3" className={moduleStyles.paragraph}>
          {i18n.shareLibraryWithClassmate()}
        </MuiTypography>
        <MuiButton
          variant="contained"
          color="secondary"
          size="medium"
          onClick={this.props.openLibraryCreationDialog}
          type="button"
        >
          {i18n.shareLibrary()}
        </MuiButton>
      </div>
    );
  };

  buildTabs() {
    const {exportApp, librariesEnabled} = this.props;
    const tabs = [];
    if (exportApp) {
      tabs.push({
        value: ShareOptions.EXPORT,
        text: i18n.exportForWeb(),
        tabContent: this.renderExportTab(),
      });
    }
    tabs.push({
      value: ShareOptions.EMBED,
      text: i18n.embed(),
      tabContent: this.renderEmbedTab(),
    });
    if (librariesEnabled) {
      tabs.push({
        value: ShareOptions.LIBRARY,
        text: i18n.shareLibrary(),
        tabContent: this.renderLibraryTab(),
      });
    }
    return tabs;
  }

  render() {
    const {expanded, exportApp, onExpand} = this.props;
    const tabs = this.buildTabs();
    if (tabs.length === 0) {
      return null;
    }
    if (!expanded) {
      const handleExpand = e => {
        e.preventDefault();
        onExpand();
      };
      return (
        <div className={moduleStyles.root}>
          <Link
            text={i18n.advancedShare()}
            onClick={handleExpand}
            role="button"
            size="s"
          />
        </div>
      );
    }
    const defaultTab = exportApp ? ShareOptions.EXPORT : ShareOptions.EMBED;
    return (
      <div className={moduleStyles.root}>
        <Tabs
          tabs={tabs}
          name="advanced-share-options"
          defaultSelectedTabValue={defaultTab}
          onChange={() => {}}
          size="s"
          tabsContainerClassName={moduleStyles.tabsContainer}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    librariesEnabled: state.pageConstants.librariesEnabled,
  }),
  dispatch => ({
    openLibraryCreationDialog() {
      dispatch(showLibraryCreationDialog());
      dispatch(hideShareDialog());
    },
  })
)(AdvancedShareOptions);
