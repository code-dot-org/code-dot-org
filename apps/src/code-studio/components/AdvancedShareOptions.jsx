import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import * as color from '../../util/color';
import {CIPHER, ALPHABET} from '../../constants';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {hideShareDialog, showLibraryCreationDialog} from './shareDialogRedux';

const INSTRUCTIONS_LINK =
  'https://codeorg.zendesk.com/knowledge/articles/360004789872';

const style = {
  nav: {
    ul: {
      borderBottom: '1px solid',
      borderColor: color.purple,
      marginTop: 0,
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 10
    },
    li: {
      display: 'inline-block',
      color: color.light_gray,
      fontSize: 'larger',
      fontWeight: 'bold',
      marginRight: 10,
      cursor: 'pointer'
    },
    selectedLi: {color: color.purple}
  },
  ol: {
    marginLeft: 15
  },
  p: {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit'
  },
  bold: {
    fontFamily: "'Gotham 7r', sans-serif"
  },
  root: {
    marginTop: 20
  },
  expand: {
    color: color.purple,
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  embedInput: {
    cursor: 'copy',
    width: 465,
    height: 80,
    margin: 0
  },
  expoButton: {
    flex: 1,
    fontSize: 15,
    marginLeft: 0,
    marginRight: 20
  },
  expoButtonLast: {
    marginRight: 0
  },
  expoContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  expoExportButtonRow: {
    justifyContent: 'space-evenly',
    marginBottom: 15
  },
  expoExportColumn: {
    flex: 1
  },
  expoExportQRCodeRow: {
    marginBottom: 20
  },
  expoExportRow: {
    display: 'flex',
    flexGrow: 1
  },
  expoInput: {
    cursor: 'copy',
    width: 'unset'
  },
  qrCode: {
    marginRight: 20
  }
};

const ShareOptions = {
  EXPORT: 'export',
  EXPORT_EXPO: 'exportExpo',
  EMBED: 'embed',
  LIBRARY: 'library'
};

class AdvancedShareOptions extends React.Component {
  static propTypes = {
    shareUrl: PropTypes.string.isRequired,
    allowExportExpo: PropTypes.bool.isRequired,
    exportApp: PropTypes.func,
    librariesEnabled: PropTypes.bool,
    openLibraryCreationDialog: PropTypes.func.isRequired,
    onExpand: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    channelId: PropTypes.string.isRequired,
    embedOptions: PropTypes.shape({
      iframeHeight: PropTypes.number.isRequired,
      iframeWidth: PropTypes.number.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: props.exportApp
        ? props.allowExportExpo
          ? ShareOptions.EXPORT_EXPO
          : ShareOptions.EXPORT
        : ShareOptions.EMBED,
      exportedExpoZip: false,
      exporting: false,
      exportingExpo: null,
      exportError: null,
      exportExpoError: null,
      embedWithoutCode: false
    };
  }

  downloadExport = () => {
    this.setState({exporting: true});
    this.props
      .exportApp()
      .then(this.setState.bind(this, {exporting: false}), () => {
        this.setState({
          exporting: false,
          exportError: 'Failed to export project. Please try again later.'
        });
      });
  };

  downloadExpoExport = async () => {
    this.setState({
      exportedExpoZip: true,
      exportingExpo: 'zip'
    });
    try {
      await this.props.exportApp({mode: 'expoZip'});
      this.setState({
        exportingExpo: null,
        exportExpoError: null
      });
    } catch (e) {
      this.setState({
        exportingExpo: null,
        exportExpoError: 'Failed to export project. Please try again later.'
      });
    }
  };

  publishExpoExport = async () => {
    this.setState({exportingExpo: 'publish'});
    try {
      const {
        expoUri,
        expoSnackId,
        iconUri,
        splashImageUri
      } = await this.props.exportApp({
        mode: 'expoPublish'
      });
      this.setState({
        exportingExpo: null,
        exportExpoError: null,
        expoUri,
        expoSnackId,
        iconUri,
        splashImageUri
      });
    } catch (e) {
      this.setState({
        exportingExpo: null,
        expoUri: null,
        expoSnackId: null,
        exportExpoError:
          'Failed to publish project to Expo. Please try again later.'
      });
    }
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
        <textarea
          type="text"
          onClick={e => e.target.select()}
          readOnly="true"
          value={iframeHtml}
          style={style.embedInput}
        />
        <label style={{display: 'flex'}}>
          <input
            type="checkbox"
            checked={this.state.embedWithoutCode}
            onChange={() =>
              this.setState({embedWithoutCode: !this.state.embedWithoutCode})
            }
          />
          <span style={{marginLeft: 5}}>Hide ability to view code</span>
        </label>
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
        <button
          type="button"
          onClick={this.downloadExport}
          style={{marginLeft: 0}}
        >
          {spinner}
          Export
        </button>
        {alert}
      </div>
    );
  }

  onInputSelect = ({target}) => {
    target.select();
  };

  renderExportExpoTab() {
    const {expoUri, exportedExpoZip} = this.state;
    const exportSpinner =
      this.state.exportingExpo === 'zip' ? (
        <i className="fa fa-spinner fa-spin" />
      ) : null;
    const publishSpinner =
      this.state.exportingExpo === 'publish' ? (
        <i className="fa fa-spinner fa-spin" />
      ) : null;
    // TODO: Make this use a nice UI component from somewhere.
    const alert = this.state.exportExpoError ? (
      <div className="alert fade in">{this.state.exportExpoError}</div>
    ) : null;

    return (
      <div>
        <p style={style.p}>
          Try running your project in the Expo app on iOS or Android. You can
          also export the app and follow our
          <a href={INSTRUCTIONS_LINK} style={style.bold}>
            {' '}
            step-by-step guide{' '}
          </a>
          to submit your app to the Google Play Store.
        </p>
        <div style={style.expoContainer}>
          <div style={[style.expoExportRow, style.expoExportButtonRow]}>
            <button
              type="button"
              onClick={this.publishExpoExport}
              style={style.expoButton}
            >
              {publishSpinner}
              Test in Expo App
            </button>
            <button
              type="button"
              onClick={this.downloadExpoExport}
              style={[style.expoButton, style.expoButtonLast]}
            >
              {exportSpinner}
              Export to Create Native Android App
            </button>
          </div>
          {!!expoUri && (
            <div style={[style.expoExportRow, style.expoExportQRCodeRow]}>
              <QRCode style={style.qrCode} value={expoUri} />
              <div style={style.expoExportColumn}>
                <div style={style.expoContainer}>
                  <div>
                    <p style={[style.p, style.bold]}>Expo App Instructions:</p>
                    <ol style={[style.p, style.ol]}>
                      <li>Install the Expo app on your phone.</li>
                      <li>
                        Scan the QR code from within the Expo app on Android or
                        from your camera app on iOS (click on the notification
                        that pops up on iOS).
                      </li>
                      <li>
                        If #2 doesn't work, send the URL below to your phone and
                        click the link.
                      </li>
                    </ol>
                  </div>
                  <input
                    type="text"
                    onClick={this.onInputSelect}
                    readOnly="true"
                    value={expoUri}
                    style={style.expoInput}
                  />
                </div>
              </div>
            </div>
          )}
          {!expoUri && exportedExpoZip && (
            <div style={style.expoExportRow}>
              <div style={style.expoContainer}>
                <p style={style.p}>
                  Once your app finishes downloading,
                  <a href={INSTRUCTIONS_LINK} style={style.bold}>
                    {' '}
                    follow these instructions{' '}
                  </a>
                  to create a native Android app and submit it to the Google
                  Play Store.
                </p>
              </div>
            </div>
          )}
          <div style={style.expoExportRow}>{alert}</div>
        </div>
      </div>
    );
  }

  renderLibraryTab = () => {
    return (
      <div>
        <p style={style.p}>{i18n.shareLibraryWithClassmate()}</p>
        <button
          type="button"
          onClick={this.props.openLibraryCreationDialog}
          style={{marginLeft: 0}}
        >
          {i18n.shareLibrary()}
        </button>
      </div>
    );
  };

  renderAdvancedListItem = (option, name) => {
    return (
      <li
        style={[
          style.nav.li,
          this.state.selectedOption === option && style.nav.selectedLi
        ]}
        onClick={() => this.setState({selectedOption: option})}
      >
        {name}
      </li>
    );
  };

  render() {
    let {
      expanded,
      exportApp,
      allowExportExpo,
      onExpand,
      librariesEnabled
    } = this.props;
    let {selectedOption} = this.state;
    if (!selectedOption) {
      // no options are available. Render nothing.
      return null;
    }

    let optionsNav, selectedTab, libraryTab;
    if (expanded) {
      let exportTab = null;
      let exportExpoTab = null;
      if (exportApp) {
        if (allowExportExpo) {
          exportExpoTab = this.renderAdvancedListItem(
            ShareOptions.EXPORT_EXPO,
            i18n.runNatively()
          );
        }
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
            {exportExpoTab}
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
        case ShareOptions.EXPORT_EXPO:
          selectedTab = this.renderExportExpoTab();
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
    librariesEnabled: state.pageConstants.librariesEnabled
  }),
  dispatch => ({
    openLibraryCreationDialog() {
      dispatch(showLibraryCreationDialog());
      dispatch(hideShareDialog());
    }
  })
)(Radium(AdvancedShareOptions));
