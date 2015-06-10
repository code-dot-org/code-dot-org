/* global $*/

var React = require('react');
var applabMsg = require('./locale');
var elementLibrary = require('./designElements/library');

var DeleteElementButton = require('./designElements/DeleteElementButton.jsx');

var nextKey = 0;

var DesignProperties = module.exports = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {selectedTab: TabType.PROPERTIES};
  },

  /**
   * Handle a click on a tab, such as 'properties' or 'events'.
   * @param newTab {TabType} Tab to switch to.
   */
  handleTabClick: function(newTab) {
    this.setState({selectedTab: newTab})
  },

  render: function() {
    if (!this.props.element) {
      return <p>{applabMsg.designWorkspaceDescription()}</p>;
    }

    // We want to have a unique key that doesn't change when the element id
    // changes, and has no risk of collisions between elements. We add this to
    // the backing element using jquery.data(), which keeps its own per-session
    // store of data, without affecting the serialiazation
    var key = $(this.props.element).data('key');
    if (!key) {
      key = nextKey++;
      $(this.props.element).data('key', key);
    }

    var elementType = elementLibrary.getElementType(this.props.element);
    var propertyClass = elementLibrary.getElementPropertyTable(elementType);

    var propertiesElement = React.createElement(propertyClass, {
      element: this.props.element,
      handleChange: this.props.handleChange,
      onDepthChange: this.props.onDepthChange
    });

    var deleteButton;
    var element = this.props.element;
    // First screen is not deletable
    var firstScreen = elementType === elementLibrary.ElementType.SCREEN &&
        element.parentNode.firstChild === element;
    if (!firstScreen) {
      deleteButton = (<DeleteElementButton
        shouldConfirm={elementType === elementLibrary.ElementType.SCREEN}
        handleDelete={this.props.onDelete}/>);
    }

    var tabHeight = 35;
    var borderColor = '#c6cacd';
    var bgColor = '#e7e8ea';

    var defaultTabStyle = {
      borderColor: borderColor,
      borderStyle: 'solid',
      borderWidth: '1px 1px 1px 0',
      boxSizing: 'border-box',
      height: tabHeight,
      padding: '0 10px'
    };
    var activeTabStyle = {
      backgroundColor: bgColor,
      borderWidth: '1px 1px 0 0'
    };
    var propertiesTabStyle = $.extend({}, defaultTabStyle, {
      float: 'left'
    }, this.state.selectedTab === TabType.PROPERTIES ? activeTabStyle : {});
    var eventsTabStyle = $.extend({}, defaultTabStyle, {
      float: 'left'
    }, this.state.selectedTab === TabType.EVENTS ? activeTabStyle : {});
    var emptyTabStyle = $.extend({}, defaultTabStyle, {
      width: '100%',
      borderWidth: '0 0 1px 0'
    });

    var workspaceDescriptionStyle = {
      height: 28,
      overflow: 'hidden'
    };

    var workspaceTabsStyle = {
      borderColor: borderColor,
      borderStyle: 'solid',
      borderWidth: '0 0 0 1px'
    }

    var tabLabelStyle = {
      lineHeight: tabHeight + 'px',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none'
    };

    var workspaceBodyStyle = {
      height: 'calc(100% - 83px)',
      padding: 10,
      borderColor: borderColor,
      borderStyle: 'solid',
      borderWidth: '0 1px 1px 1px',
      backgroundColor: bgColor,
      overflowY: 'scroll'
    };

    var propertiesBodyStyle = {
      display: this.state.selectedTab === TabType.PROPERTIES ? '' : 'none'
    };
    var eventsBodyStyle = {
      minHeight: 200,
      display: this.state.selectedTab === TabType.EVENTS ? '' : 'none'
    };

    return (
      <div style={{height: '100%'}}>
        <div id="designDescription" style={workspaceDescriptionStyle}>
          <p>{applabMsg.designWorkspaceDescription()}</p>
        </div>
        <div id="designWorkspaceTabs" style={workspaceTabsStyle}>
          <div id="propertiesTab" style={propertiesTabStyle} className="hover-pointer"
              onClick={this.handleTabClick.bind(this, TabType.PROPERTIES)}>
            <span style={tabLabelStyle}>PROPERTIES</span>
          </div>
          <div id="eventsTab" style={eventsTabStyle} className="hover-pointer"
              onClick={this.handleTabClick.bind(this, TabType.EVENTS)}>
            <span style={tabLabelStyle}>EVENTS</span>
          </div>
          <div id="emptyTab" style={emptyTabStyle}>
          </div>
        </div>
        <div id="designWorkspaceBody" style={workspaceBodyStyle}>
          <div id="propertiesBody" style={propertiesBodyStyle}>
            {/* We provide a key to the outer div so that element foo and element bar are
               seen to be two completely different tables. Otherwise the defaultValues
               in inputs don't update correctly. */}
            <div key={key}>
              {propertiesElement}
              {deleteButton}
            </div>
          </div>
          <div id="eventsBody" style={eventsBodyStyle}>
            coming soon...
          </div>
        </div>
      </div>
    );
  }
});

/**
 * @readonly
 * @enum {string}
 */
var TabType = {
  PROPERTIES: 'properties',
  EVENTS: 'events'
};
DesignProperties.TabType = TabType;
