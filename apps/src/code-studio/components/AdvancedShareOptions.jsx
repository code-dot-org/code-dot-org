import Alert from '@code-dot-org/component-library/alert';
import Button, {buttonColors} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import {CIPHER, ALPHABET} from '../../constants';

import {hideShareDialog, showLibraryCreationDialog} from './shareDialogRedux';

import styles from './advanced-share-options.module.scss';

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

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: props.exportApp
        ? ShareOptions.EXPORT
        : ShareOptions.EMBED,
      exporting: false,
      exportError: null,
      embedWithoutCode: false,
    };
  }

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
      <div>
        <p className={styles.paragraph}>{i18n.shareEmbedDescription()}</p>
        <p className={classNames(styles.paragraph, styles.warningParagraph)}>
          {i18n.shareEmbedWarning()}
        </p>
        <textarea
          type="text"
          onClick={e => e.target.select()}
          readOnly={true}
          value={iframeHtml}
          className={styles.embedInput}
          aria-label={i18n.codeToEmbed()}
        />
        <div>
          <input
            id="embedCodeCheckbox"
            type="checkbox"
            className={styles.embedCodeCheckbox}
            checked={this.state.embedWithoutCode}
            onChange={() =>
              this.setState({embedWithoutCode: !this.state.embedWithoutCode})
            }
          />
          <label
            htmlFor="embedCodeCheckbox"
            className={styles.embedCodeCheckboxLabel}
          >
            {i18n.hideAbilityToViewCode()}
          </label>
        </div>
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
      <div>
        <p className={styles.paragraph}>
          Export your project as a zipped file, which will contain the
          HTML/CSS/JS files, as well as any assets, for your project. For
          instructions to run your exported project locally, see{' '}
          <a href={exportSupportLink} target="_blank" rel="noreferrer">
            our documentation
          </a>
          .
        </p>
        <Button
          color={buttonColors.black}
          isPending={this.state.exporting}
          text={i18n.exportForWeb()}
          onClick={this.downloadExport}
          className={styles.exportButton}
        />
        {alert}
      </div>
    );
  }

  onInputSelect = ({target}) => {
    target.select();
  };

  renderLibraryTab = () => {
    return (
      <div>
        <p className={styles.paragraph}>{i18n.shareLibraryWithClassmate()}</p>
        <Button
          color={buttonColors.black}
          onClick={this.props.openLibraryCreationDialog}
          className={styles.shareLibraryButton}
          text={i18n.shareLibrary()}
        />
      </div>
    );
  };

  renderAdvancedListItem = (option, name) => {
    return (
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
      <li
        className={classNames(styles.navItem, {
          [styles.navItemSelected]: this.state.selectedOption === option,
        })}
        onClick={() => this.setState({selectedOption: option})}
      >
        {name}
      </li>
    );
  };

  render() {
    let {expanded, exportApp, onExpand, librariesEnabled} = this.props;
    let {selectedOption} = this.state;
    if (!selectedOption) {
      // no options are available. Render nothing.
      return null;
    }

    let optionsNav, selectedTab, libraryTab;
    if (expanded) {
      let exportTab = null;
      if (exportApp) {
        exportTab = this.renderAdvancedListItem(
          ShareOptions.EXPORT,
          i18n.exportForWeb()
        );
      }
      const embedTab = this.renderAdvancedListItem(
        ShareOptions.EMBED,
        i18n.embed()
      );
      if (librariesEnabled) {
        libraryTab = this.renderAdvancedListItem(
          ShareOptions.LIBRARY,
          i18n.shareLibrary()
        );
      }
      optionsNav = (
        <div>
          <ul className={styles.navList}>
            {exportTab}
            {embedTab}
            {libraryTab}
          </ul>
        </div>
      );
      switch (selectedOption) {
        case ShareOptions.EXPORT:
          selectedTab = this.renderExportTab();
          break;
        case ShareOptions.EMBED:
          selectedTab = this.renderEmbedTab();
          break;
        case ShareOptions.LIBRARY:
          selectedTab = this.renderLibraryTab();
          break;
      }
    }
    const expand =
      expanded && selectedOption ? null : (
        <a onClick={onExpand} className={styles.expand}>
          {i18n.advancedShare()}
        </a>
      );
    return (
      <div className={styles.root}>
        {expand}
        {optionsNav}
        {selectedTab}
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
