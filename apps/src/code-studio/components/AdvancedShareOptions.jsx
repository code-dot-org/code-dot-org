import React from 'react';
import Radium from 'radium';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import * as color from '../../util/color';
import {CIPHER, ALPHABET} from '../../constants';
import experiments from '@cdo/apps/util/experiments';
import {hideShareDialog} from './shareDialogRedux';
import {showLibraryShareDialog} from './libraryShareDialogRedux';

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
  errorMessage: {
    color: color.red,
    margin: 7
  },
  libraryName: {
    fontSize: 'large',
    lineHeight: 'inherit',
    color: 'inherit',
    fontWeight: 'bold'
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
  expoButtonApk: {
    marginBottom: 10,
    maxWidth: 280
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
  },
  closeButton: {
    marginRight: 0,
    backgroundColor: color.orange,
    color: color.white,
    position: 'absolute',
    right: 0
  }
};

class AdvancedShareOptions extends React.Component {
  static propTypes = {
    shareUrl: PropTypes.string.isRequired,
    allowExportExpo: PropTypes.bool.isRequired,
    exportApp: PropTypes.func,
    onExpand: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    i18n: PropTypes.object.isRequired,
    channelId: PropTypes.string.isRequired,
    embedOptions: PropTypes.shape({
      iframeHeight: PropTypes.number.isRequired,
      iframeWidth: PropTypes.number.isRequired
    }).isRequired,
    openPublishLibraryDialog: PropTypes.func,
    libraryName: PropTypes.string,
    containsError: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: props.exportApp
        ? props.allowExportExpo
          ? 'exportExpo'
          : 'export'
        : 'embed',
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

  generateExpoApk = async () => {
    const {expoSnackId, iconUri, splashImageUri} = this.state;
    this.setState({generatingExpoApk: true});
    try {
      const expoApkUri = await this.props.exportApp({
        mode: 'expoGenerateApk',
        expoSnackId,
        iconUri,
        splashImageUri
      });
      this.setState({
        generatingExpoApk: false,
        generatingExpoApkError: null,
        expoApkUri
      });
    } catch (e) {
      this.setState({
        generatingExpoApk: false,
        generatingExpoApkError:
          'Failed to create Android app. Please try again later.'
      });
    }
  };

  visitExpoSite = () => {
    const {expoSnackId} = this.state;
    window.open(`https://snack.expo.io/${expoSnackId}`, '_blank');
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
        <p style={style.p}>
          {this.props.i18n.t('project.share_embed_description')}
        </p>
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

  clickedPublishLibrary = () => {
    if (!this.props.containsError) {
      this.props.openPublishLibraryDialog();
    }
  };

  publishButtonStyle = () => {
    return {
      marginLeft: 0,
      color: color.white,
      backgroundColor: this.props.containsError
        ? color.background_gray
        : color.cyan
    };
  };

  renderLibraryTab() {
    return (
      <div>
        <p style={style.p}>
          Library links let you add libraries to other projects. You can add
          libraries to your project by going to the Settings icon in your
          Toolbox, and choosing "Manage Libraries."
        </p>
        <p style={style.libraryName}>Library name: {this.props.libraryName}</p>
        <div style={{display: 'flex'}}>
          <button
            type="button"
            onClick={this.clickedPublishLibrary}
            style={this.publishButtonStyle()}
          >
            Publish
          </button>
          {this.props.containsError && (
            <p style={{...style.p, ...style.errorMessage}}>
              We can’t publish your library because there is an error in the
              code. Go look for the red error indicator and fix the bugs.
            </p>
          )}
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
    const {
      expoUri,
      exportedExpoZip,
      expoApkUri,
      generatingExpoApk
    } = this.state;
    const exportSpinner =
      this.state.exportingExpo === 'zip' ? (
        <i className="fa fa-spinner fa-spin" />
      ) : null;
    const publishSpinner =
      this.state.exportingExpo === 'publish' ? (
        <i className="fa fa-spinner fa-spin" />
      ) : null;
    const generateApkSpinner = generatingExpoApk ? (
      <i className="fa fa-spinner fa-spin" />
    ) : null;
    // TODO: Make this use a nice UI component from somewhere.
    const alert = this.state.exportExpoError ? (
      <div className="alert fade in">{this.state.exportExpoError}</div>
    ) : null;
    const apkAlert = this.state.generatingExpoApkError ? (
      <div className="alert fade in">{this.state.generatingExpoApkError}</div>
    ) : null;
    const apkStatusString = expoApkUri
      ? 'App created successfully'
      : generatingExpoApk
      ? 'Creating app...'
      : '(This will take 5-10 minutes)';

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
                  <button
                    type="button"
                    onClick={this.generateExpoApk}
                    style={[style.expoButton, style.expoButtonApk]}
                  >
                    {generateApkSpinner}
                    Create Android App
                  </button>
                  <button
                    type="button"
                    onClick={this.visitExpoSite}
                    style={[style.expoButton, style.expoButtonApk]}
                  >
                    Visit Expo Site
                  </button>
                  <p style={style.p}>{apkStatusString}</p>
                  {!!expoApkUri && (
                    <div>
                      <p style={[style.p, style.bold]}>
                        Send this URL to an Android phone:
                      </p>
                    </div>
                  )}
                  {!!expoApkUri && (
                    <input
                      type="text"
                      onClick={this.onInputSelect}
                      readOnly="true"
                      value={expoApkUri}
                      style={style.expoInput}
                    />
                  )}
                  {apkAlert}
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

  render() {
    if (!this.state.selectedOption) {
      // no options are available. Render nothing.
      return null;
    }
    let optionsNav;
    let selectedOption;
    if (this.props.expanded) {
      let exportTab = null;
      let exportExpoTab = null;
      if (this.props.exportApp) {
        if (this.props.allowExportExpo) {
          exportExpoTab = (
            <li
              style={[
                style.nav.li,
                this.state.selectedOption === 'exportExpo' &&
                  style.nav.selectedLi
              ]}
              onClick={() => this.setState({selectedOption: 'exportExpo'})}
            >
              Run natively (Beta)
            </li>
          );
        }
        exportTab = (
          <li
            style={[
              style.nav.li,
              this.state.selectedOption === 'export' && style.nav.selectedLi
            ]}
            onClick={() => this.setState({selectedOption: 'export'})}
          >
            Export for web
          </li>
        );
      }
      const embedTab = (
        <li
          style={[
            style.nav.li,
            this.state.selectedOption === 'embed' && style.nav.selectedLi
          ]}
          onClick={() => this.setState({selectedOption: 'embed'})}
        >
          {this.props.i18n.t('project.embed')}
        </li>
      );
      optionsNav = (
        <div>
          <ul style={style.nav.ul}>
            {exportExpoTab}
            {exportTab}
            {embedTab}
            {experiments.isEnabled('student-libraries') && (
              <li
                style={[
                  style.nav.li,
                  this.state.selectedOption === 'library' &&
                    style.nav.selectedLi
                ]}
                onClick={() => this.setState({selectedOption: 'library'})}
              >
                Library
              </li>
            )}
          </ul>
        </div>
      );
      switch (this.state.selectedOption) {
        case 'export':
          selectedOption = this.renderExportTab();
          break;
        case 'exportExpo':
          selectedOption = this.renderExportExpoTab();
          break;
        case 'embed':
          selectedOption = this.renderEmbedTab();
          break;
        case 'library':
          selectedOption = this.renderLibraryTab();
          break;
      }
    }
    const expand =
      this.props.expanded && this.state.selectedOption ? null : (
        <a onClick={this.props.onExpand} style={style.expand}>
          {this.props.i18n.t('project.advanced_share')}
        </a>
      );
    return (
      <div style={style.root}>
        {expand}
        {optionsNav}
        {selectedOption}
      </div>
    );
  }
}

export const UnconnectedAdvancedShareOptions = Radium(AdvancedShareOptions);
export default connect(
  state => ({
    libraryName: state.libraryShareDialog.libraryName,
    containsError: state.libraryShareDialog.containsError
  }),
  dispatch => ({
    openPublishLibraryDialog() {
      dispatch(showLibraryShareDialog());
      dispatch(hideShareDialog());
    }
  })
)(Radium(AdvancedShareOptions));
