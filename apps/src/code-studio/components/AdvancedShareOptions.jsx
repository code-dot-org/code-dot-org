import React from 'react';
import Radium from 'radium';
import * as color from "../../util/color";
import {CIPHER, ALPHABET} from '../../constants';

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
      color: color.light_gray,
      fontSize: 'larger',
      fontWeight: 'bold',
      marginRight: 10,
      cursor: 'pointer',
    },
    selectedLi: {color:color.purple},
  },
  p: {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
  },
  root: {
    marginTop: 20,
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
    margin: 0,
  },
};

const AdvancedShareOptions = Radium(React.createClass({
  propTypes: {
    onClickExport: React.PropTypes.func,
    onExpand: React.PropTypes.func.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    i18n: React.PropTypes.object.isRequired,
    channelId: React.PropTypes.string.isRequired,
    embedOptions: React.PropTypes.shape({
      iframeHeight: React.PropTypes.number.isRequired,
      iframeWidth: React.PropTypes.number.isRequired,
    }).isRequired,
  },

  getInitialState() {
    return {
      selectedOption: (this.props.onClickExport && 'export') || 'embed',
      exporting: false,
      exportError: null,
      embedWithoutCode: false,
    };
  },

  downloadExport() {
    this.setState({exporting: true});
    this.props.onClickExport().then(
      this.setState.bind(this, {exporting: false}),
      () => {
        this.setState({
          exporting: false,
          exportError: 'Failed to export project. Please try again later.'
        });
      }
    );
  },

  renderEmbedTab() {
    let url = window.location.href.replace('edit', 'embed');
    if (this.state.embedWithoutCode) {
      // When embedding without code, we "hide" the real channel id for the
      // project by encoding it with a cipher. This is not meant to be secure,
      // it is just meant to make the bar slightly higher for people trying
      // to get to the original source.
      url = url.replace(
        this.props.channelId,
        this.props.channelId
          .split('')
          .map(char => CIPHER[ALPHABET.indexOf(char)] || char)
          .join('')
      ) + '?nosource';
    }
    const {iframeWidth, iframeHeight} = this.props.embedOptions;
    var iframeHtml =
      `<iframe width="${iframeWidth}" height="${iframeHeight}" style="border: 0px;" src="${url}"></iframe>`;
    return (
      <div>
        <p style={style.p}>
          {this.props.i18n.t('project.share_embed_description')}
        </p>
        <textarea
          type="text"
          onClick={(e) => e.target.select()}
          readOnly="true"
          value={iframeHtml}
          style={style.embedInput}
        />
        <label style={{display: 'flex'}}>
          <input
            type="checkbox"
            checked={this.state.embedWithoutCode}
            onChange={() => this.setState({embedWithoutCode: !this.state.embedWithoutCode})}
          />
          <span style={{marginLeft: 5}}>
            Hide ability to view code
          </span>
        </label>
      </div>
    );
  },

  renderExportTab() {
    var spinner = this.state.exporting ?
          <i className="fa fa-spinner fa-spin"></i> :
          null;
    // TODO: Make this use a nice UI component from somewhere.
    var alert = this.state.exportError ? (
      <div className="alert fade in">
        {this.state.exportError}
      </div>
    ) : null;

    return (
      <div>
        <p style={style.p}>
          Export your project as a zipped file, which will contain the
          HTML/CSS/JS files, as well as any assets, for your project.
          Note that data APIs will not work outside of Code Studio.
        </p>
        <button onClick={this.downloadExport} style={{marginLeft: 0}}>
          {spinner}
          Export
        </button>
        {alert}
      </div>
    );
  },

  render() {
    if (!this.state.selectedOption) {
      // no options are available. Render nothing.
      return null;
    }
    var optionsNav;
    var selectedOption;
    if (this.props.expanded) {
      var exportTab = null;
      if (this.props.onClickExport) {
        exportTab = (
          <li
            style={[
              style.nav.li,
              this.state.selectedOption === 'export' && style.nav.selectedLi
            ]}
            onClick={() => this.setState({selectedOption: 'export'})}
          >
            Export
          </li>
        );
      }
      var embedTab = (
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
            {exportTab}
            {embedTab}
          </ul>
        </div>
      );
      if (this.state.selectedOption === 'export') {
        selectedOption = this.renderExportTab();
      } else if (this.state.selectedOption === 'embed') {
        selectedOption = this.renderEmbedTab();
      }
    }
    var expand = this.props.expanded && this.state.selectedOption ? null :
          (
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
}));

export default AdvancedShareOptions;
