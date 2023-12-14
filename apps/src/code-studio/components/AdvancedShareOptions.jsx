import React from 'react';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import PropTypes from 'prop-types';
import * as color from '../../util/color';
import {CIPHER, ALPHABET} from '../../constants';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {hideShareDialog, showLibraryCreationDialog} from './shareDialogRedux';
import Button from '../../templates/Button';
import moduleStyle from './components.module.scss';
import classnames from 'classnames';

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
        <p className={moduleStyle.advancedShareOptionsRegularText}>
          {i18n.shareEmbedDescription()}
        </p>
        <p
          className={classnames(
            moduleStyle.advancedShareOptionsRegularText,
            moduleStyle.advancedShareOptionsWarningText
          )}
        >
          {i18n.shareEmbedWarning()}
        </p>
        <textarea
          type="text"
          onClick={e => e.target.select()}
          readOnly="true"
          value={iframeHtml}
          className={moduleStyle.embedInput}
        />
        <label style={{display: 'flex'}}>
          <input
            type="checkbox"
            style={{accentColor: color.brand_primary_default}}
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
        <p className={moduleStyle.advancedShareOptionsRegularText}>
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
        <p className={moduleStyle.advancedShareOptionsRegularText}>
          {i18n.shareLibraryWithClassmate()}
        </p>
        <Button
          color={Button.ButtonColor.neutralDark}
          onClick={this.props.openLibraryCreationDialog}
          className={moduleStyle.shareLibraryButton}
          style={{
            margin: 0,
            fontSize: 'large',
            height: 40,
          }}
          text={i18n.shareLibrary()}
        />
      </div>
    );
  };

  renderAdvancedListItem = (option, name) => {
    const selected = this.state.selectedOption === option;
    const buttonClassNames = classnames(
      moduleStyle.advancedShareOptionsButton,
      {
        [moduleStyle.selectedAdvancedShareOption]: selected,
        [moduleStyle.unselectedAdvancedShareOption]: !selected,
      }
    );
    return (
      <li>
        <button
          onClick={() => this.setState({selectedOption: option})}
          className={buttonClassNames}
          type="button"
        >
          {name}
        </button>
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
        <div className={moduleStyle.advancedShareOptionsNav}>
          <ul>
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
        <button onClick={onExpand} className={moduleStyle.expand} type="button">
          {i18n.advancedShare()}
        </button>
      );
    return (
      <div className={moduleStyle.advancedShareOptionsRoot}>
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
