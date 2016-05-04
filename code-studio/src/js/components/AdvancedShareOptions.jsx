var color = require('../color.js');

const style = {
  nav: {
    ul: {
      borderBottom: '1px solid',
      borderColor: color.purple,
      margin: 0,
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
  },
};

var AdvancedShareOptions = React.createClass({
  propTypes: {
    onClickExport: React.PropTypes.func,
    i18n: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      expanded: false,
      selectedOption: this.props.onClickExport ? 'export' : 'embed',
      exporting: false,
      exportError: null,
    };
  },

  expand() {
    this.setState({expanded: true});
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
    var iframeHtml = '<iframe width="352" height="612" style="border: 1px solid black;" src="' +
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
          style={style.embedInput}></textarea>
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
    var optionsNav;
    var selectedOption;
    if (this.state.expanded) {
      var selectedLiStyle = Object.assign({}, style.nav.li, {color:color.purple});
      var exportTab = null;
      if (this.props.onClickExport) {
        exportTab = (
          <li style={this.state.selectedOption === 'export' ? selectedLiStyle : style.nav.li}
              onClick={() => this.setState({selectedOption: 'export'})}>
            Export
          </li>
        );
      }
      optionsNav = (
        <div>
          <ul style={style.nav.ul}>
            {exportTab}
            <li style={this.state.selectedOption === 'embed' ? selectedLiStyle : style.nav.li}
                onClick={() => this.setState({selectedOption: 'embed'})}>
              {this.props.i18n.t('project.embed')}
            </li>
          </ul>
        </div>
      );
      if (this.state.selectedOption === 'export') {
        selectedOption = this.renderExportTab();
      } else if (this.state.selectedOption === 'embed') {
        selectedOption = this.renderEmbedTab();
      }
    }
    var expand = this.state.expanded && this.state.selectedOption ? null :
          (
            <a onClick={this.expand} style={style.expand}>
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
});

module.exports = AdvancedShareOptions;
