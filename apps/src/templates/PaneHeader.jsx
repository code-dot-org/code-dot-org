var Radium = require('radium');

var commonStyles = require('../commonStyles');
var styleConstants = require('../styleConstants');
var color = require('../color');
var experiments = require('../experiments');

var styles = {
  workspaceHeader: {
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    height: styleConstants["workspace-headers-height"],
    lineHeight: styleConstants["workspace-headers-height"] + 'px',
  },
  workspaceHeaderButton: {
    cursor: 'pointer',
    float: 'right',
    overflow: 'hidden',
    backgroundColor: color.light_purple,
    marginTop: 3,
    marginBottom: 3,
    marginRight: 3,
    marginLeft: 0,
    height: 24,
    borderRadius: 4,
    fontFamily: '"Gotham 5r", sans-serif',
    lineHeight: '18px',
    ':hover': {
      backgroundColor: color.cyan
    }
  },
  workspaceHeaderButtonUnfocused: {
    backgroundColor: color.lightest_purple
  },
  headerButtonSpan: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 0,
    paddingBottom: 0
  },
  headerButtonIcon: {
    lineHeight: '24px',
    paddingRight: 8,
    fontSize: 15,
    fontWeight: 'bold'
  },
  hiddenIcon: {
    display: 'none',
    height: 18,
    verticalAlign: 'text-bottom',
    paddingRight: 8
  }
};

// TODO - might belong elsewhere
var WorkspaceHeader = function (props) {
  return <div {...props} style={[styles.workspaceHeader, props.style]}/>;
};

var WorkspaceHeaderButton = function (props) {
  var runModeIndicators = experiments.isEnabled('runModeIndicators');

  return (
    <div
        id={props.id}
        style={[
          styles.workspaceHeaderButton,
          runModeIndicators && !props.headerHasFocus && styles.workspaceHeaderButtonUnfocused
        ]}
    >
      <span style={styles.headerButtonSpan}>
        {/* hiddenIcon currently toggle externally */}
        {props.hiddenImage && <img src={props.hiddenImage} style={styles.hiddenIcon}/>}
        <i className={props.iconClass} style={styles.headerButtonIcon}/>
        <span style={styles.noPadding}>{props.label}</span>
      </span>
    </div>
  );
};
WorkspaceHeaderButton.propTypes = {
  headerHasFocus: React.PropTypes.bool.isRequired,
  iconClass: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  hiddenImage: React.PropTypes.string
};

/**
 * A purple pane header that can be active (purple), inactive (light purple)
 * or read only (charcoal).
 */

var PaneHeader = React.createClass({
  propTypes: {
    hasFocus: React.PropTypes.bool.isRequired,
    readOnly: React.PropTypes.bool
  },

  render: function () {
    // Initially, don't want to toggle PaneHeader unless runModeIndicators is on
    var runModeIndicators = experiments.isEnabled('runModeIndicators');

    // TODO purpleHeader style should possibly move into this module
    var style = [
      commonStyles.purpleHeader,
      runModeIndicators && !this.props.hasFocus && commonStyles.purpleHeaderUnfocused,
      this.props.readOnly && commonStyles.purpleHeaderReadOnly,
    ];

    return (
      <div {...this.props} style={style}/>
    );
  }
});

module.exports = Radium(PaneHeader);

module.exports.WorkspaceHeader = Radium(WorkspaceHeader);
module.exports.WorkspaceHeaderButton = Radium(WorkspaceHeaderButton);
