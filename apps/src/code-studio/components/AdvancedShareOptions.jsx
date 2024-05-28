import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import i18n from '@cdo/locale';

import {CIPHER, ALPHABET} from '../../constants';
import Button from '../../templates/Button';
import * as color from '../../util/color';

import {hideShareDialog, showLibraryCreationDialog} from './shareDialogRedux';

const style = {
  nav: {
    ul: {
      borderBottom: '1px solid',
      borderColor: color.purple,
      marginTop: 0,
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 10,
    },
    li: {
      display: 'inline-block',
      color: color.neutral_dark90,
      ...fontConstants['main-font-semi-bold'],
      fontSize: 'larger',
      marginRight: 10,
      cursor: 'pointer',
    },
    selectedLi: {color: color.brand_secondary_default},
  },
  ol: {
    marginLeft: 15,
  },
  p: {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: color.neutral_dark,
    ...fontConstants['main-font-semi-bold'],
  },
  warningp: {
    color: color.red,
  },
  bold: {
    ...fontConstants['main-font-bold'],
  },
  root: {
    marginTop: 20,
  },
  expand: {
    color: color.brand_secondary_default,
    ...fontConstants['main-font-semi-bold'],
    cursor: 'pointer',
  },
  embedInput: {
    cursor: 'copy',
    width: 465,
    height: 80,
    margin: 0,
  },
  shareLibraryButton: {
    margin: 0,
    fontSize: 'large',
    height: 40,
  },
  embedCodeCheckbox: {
    accentColor: color.brand_primary_default,
    margin: 0,
  },
  embedCodeCheckboxLabel: {
    display: 'inline-block',
    paddingLeft: 8,
    paddingTop: 8,
  },
};

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
        <p style={style.p}>{i18n.shareEmbedDescription()}</p>
        <p style={{...style.p, ...style.warningp}}>
          {i18n.shareEmbedWarning()}
        </p>
        <textarea
          type="text"
          onClick={e => e.target.select()}
          readOnly={true}
          value={iframeHtml}
          style={style.embedInput}
          aria-label={i18n.codeToEmbed()}
        />
        <div>
          <input
            id="embedCodeCheckbox"
            type="checkbox"
            style={style.embedCodeCheckbox}
            checked={this.state.embedWithoutCode}
            onChange={() =>
              this.setState({embedWithoutCode: !this.state.embedWithoutCode})
            }
          />
          <label
            htmlFor="embedCodeCheckbox"
            style={style.embedCodeCheckboxLabel}
          >
            {i18n.hideAbilityToViewCode()}
          </label>
        </div>
      </div>
    );
  }

  renderExportTab() {
    const spinner = this.state.exporting ? (
      <i className="fa fa-spinner fa-spin" />
    ) : null;
    // TODO: Make this use a nice UI component from somewhere.
    const alert = this.state.exportError ? (
      <div className="alert fade in">{this.state.exportError}</div>
    ) : null;

    return (
      <div>
        <p style={style.p}>
          Export your project as a zipped file, which will contain the
          HTML/CSS/JS files, as well as any assets, for your project.
        </p>
        <Button
          color={Button.ButtonColor.neutralDark}
          onClick={this.downloadExport}
          style={{
            margin: 0,
            paddingRight: 11,
            fontSize: 'large',
            height: 40,
          }}
        >
          {spinner}
          Export
        </Button>
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
        <p style={style.p}>{i18n.shareLibraryWithClassmate()}</p>
        <Button
          color={Button.ButtonColor.neutralDark}
          onClick={this.props.openLibraryCreationDialog}
          style={style.shareLibraryButton}
          text={i18n.shareLibrary()}
        />
      </div>
    );
  };

  renderAdvancedListItem = (option, name) => {
    return (
      <li
        style={[
          style.nav.li,
          this.state.selectedOption === option && style.nav.selectedLi,
        ]}
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
          <ul style={style.nav.ul}>
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
        <a onClick={onExpand} style={style.expand}>
          {i18n.advancedShare()}
        </a>
      );
    return (
      <div style={style.root}>
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
)(Radium(AdvancedShareOptions));
