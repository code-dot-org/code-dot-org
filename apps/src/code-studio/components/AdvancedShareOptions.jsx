import experiments from '@cdo/apps/experiments';
var color = require('../../color.js');
var React = require('react');
var Radium = require('radium');

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

var AdvancedShareOptions = Radium(React.createClass({
  propTypes: {
    onClickExport: React.PropTypes.func,
    onExpand: React.PropTypes.func.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    i18n: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      selectedOption: (this.props.onClickExport && 'export') || 'embed',
      exporting: false,
      exportError: null,
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
    var url = window.location.href.replace('edit','embed');
    // If you change this width and height, make sure to update the
    // #visualizationColumn.wireframeShare css
    var iframeHtml = '<iframe width="352" height="612" style="border: 0px;" src="' +
          url + '"></iframe>';
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
          Hit "Download" to export your project as a zipped file,
          which will contain the HTML/CSS/JS files, as well as any
          assets, for your project. Note that data APIs will not work
          outside of Code Studio.
        </p>
        <button onClick={this.downloadExport}>
          {spinner}
          Download
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

module.exports = AdvancedShareOptions;
