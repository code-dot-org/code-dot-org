var color = require('@cdo/apps/color');

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
      color: color.purple,
      fontSize: 'larger',
      fontWeight: 'bold',
      marginRight: 10,
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
  }
};

var AdvancedShareOptions = React.createClass({
  propTypes: {
    onClickExport: React.PropTypes.func,
  },

  getInitialState() {
    return {
      expanded: false,
      selectedOption: 'export',
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
      optionsNav = (
        <div>
          <ul style={style.nav.ul}>
            <li style={style.nav.li}>Export</li>
          </ul>
        </div>
      );
      if (this.state.selectedOption === 'export') {
        selectedOption = this.renderExportTab();
      }
    }
    var expand = this.state.expanded && this.state.selectedOption ? null :
          <a onClick={this.expand} style={style.expand}>Show advanced options</a>;
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
