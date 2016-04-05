/* global $*/

var applabMsg = require('./locale');
var color = require('../color');
var elementLibrary = require('./designElements/library');
var elementUtils = require('./designElements/elementUtils');

var DeleteElementButton = require('./designElements/DeleteElementButton.jsx');
var ElementSelect = require('./ElementSelect.jsx');

var nextKey = 0;

var DesignProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement),
    elementIdList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onChangeElement: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {selectedTab: TabType.PROPERTIES};
  },

  /**
   * Handle a click on a tab, such as 'properties' or 'events'.
   * @param newTab {TabType} Tab to switch to.
   */
  handleTabClick: function (newTab) {
    this.setState({selectedTab: newTab});
  },

  render: function () {
    if (!this.props.element || !this.props.element.parentNode) {
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
    var propertyClass = elementLibrary.getElementPropertyTab(elementType);

    var propertiesElement = React.createElement(propertyClass, {
      element: this.props.element,
      handleChange: this.props.handleChange,
      onDepthChange: this.props.onDepthChange
    });

    var eventClass = elementLibrary.getElementEventTab(elementType);
    var eventsElement = React.createElement(eventClass, {
      element: this.props.element,
      handleChange: this.props.handleChange,
      onInsertEvent: this.props.onInsertEvent
    });

    var deleteButton;
    var element = this.props.element;
    // First screen is not deletable
    var isOnlyScreen = elementType === elementLibrary.ElementType.SCREEN &&
        elementUtils.getScreens().length === 1;
    if (!isOnlyScreen) {
      deleteButton = (<DeleteElementButton
        shouldConfirm={elementType === elementLibrary.ElementType.SCREEN}
        handleDelete={this.props.onDelete}/>);
    }

    var tabHeight = 35;
    var borderColor = color.lighter_gray;
    var bgColor = color.lightest_gray;

    // Diagram of how tabs outlines are drawn. 'x' represents solid border.
    // '-' and '|' represent no border.
    //
    // x----------------------------------------------------------------------|
    // x designWorkspaceTabs                                                  |
    // x                                                                      |
    // x  |xxxxxxxxxxxxxx  |xxxxxxxxxxxxxx  |xxxxxxxxxxxxxx  |-------------|  |
    // x  | inactiveTab x  |  activeTab  x  | inactiveTab x  |  emptyTab   |  |
    // x  |xxxxxxxxxxxxxx  |-------------x  |xxxxxxxxxxxxxx  |xxxxxxxxxxxxx|  |
    // x                                                                      |
    // x----------------------------------------------------------------------|
    //
    // x----------------------------------------------------------------------x
    // x designWorkspaceBody                                                  x
    // x                                                                      x
    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    var baseTabStyle = {
      borderColor: borderColor,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      height: tabHeight,
      padding: '0 10px'
    };

    /** @constant {Object} */
    var styles = {
      activeTab: $.extend({}, baseTabStyle, {
        backgroundColor: bgColor,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        float: 'left'
      }),
      inactiveTab: $.extend({}, baseTabStyle, {
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        float: 'left'
      }),
      // This tab should fill the remaining horizontal space.
      emptyTab: $.extend({}, baseTabStyle, {
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        width: '100%'
      }),
      workspaceDescription: {
        height: 28,
        overflow: 'hidden'
      },
      workspaceDescriptionText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      workspaceTabs: {
        borderColor: borderColor,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 1
      },
      tabLabel: {
        lineHeight: tabHeight + 'px',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      },
      workspaceBody: {
        height: 'calc(100% - 83px)',
        padding: '10px 10px 10px 0',
        borderColor: borderColor,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        backgroundColor: bgColor
      },
      activeBody: {
        height: '100%',
        overflowY: 'scroll'
      },
      inactiveBody: {
        display: 'none',
        height: '100%',
        overflowY: 'scroll'
      }
    };

    return (
      <div style={{height: '100%'}}>
        <div id="designDescription" style={styles.workspaceDescription}>
          <p style={styles.workspaceDescriptionText} title={applabMsg.designWorkspaceDescription()}>
            {applabMsg.designWorkspaceDescription()}
          </p>
        </div>
        <div id="designWorkspaceTabs" style={styles.workspaceTabs}>
          <div id="propertiesTab"
              style={this.state.selectedTab === TabType.PROPERTIES ? styles.activeTab : styles.inactiveTab}
              className="hover-pointer"
              onClick={this.handleTabClick.bind(this, TabType.PROPERTIES)}>
            <span style={styles.tabLabel}>PROPERTIES</span>
          </div>
          <div id="eventsTab"
              style={this.state.selectedTab === TabType.EVENTS ? styles.activeTab : styles.inactiveTab}
              className="hover-pointer"
              onClick={this.handleTabClick.bind(this, TabType.EVENTS)}>
            <span style={styles.tabLabel}>EVENTS</span>
          </div>
          <div id="emptyTab" style={styles.emptyTab}>
            <ElementSelect onChangeElement={this.props.onChangeElement}
              elementIdList={this.props.elementIdList}
              selected={this.props.element} />
          </div>
        </div>
        <div id="designWorkspaceBody" style={styles.workspaceBody}>
          <div id="propertiesBody"
              style={this.state.selectedTab === TabType.PROPERTIES ? styles.activeBody : styles.inactiveBody}>
            {/* We provide a key to the outer div so that element foo and element bar are
               seen to be two completely different tables. Otherwise the defaultValues
               in inputs don't update correctly. */}
            <div key={key}>
              {propertiesElement}
              {deleteButton}
            </div>
          </div>
          <div id="eventsBody"
              style={this.state.selectedTab === TabType.EVENTS ? styles.activeBody : styles.inactiveBody}>
            {eventsElement}
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
module.exports = DesignProperties;
