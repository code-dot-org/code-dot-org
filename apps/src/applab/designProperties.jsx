import $ from 'jquery';
import React, {PropTypes} from 'react';
import applabMsg from '@cdo/applab/locale';
import color from "../util/color";
import elementLibrary from './designElements/library';
import DeleteElementButton from './designElements/DeleteElementButton';
import ElementSelect from './ElementSelect';
import DuplicateElementButton from './designElements/DuplicateElementButton';
import CopyElementToScreenButton from './designElements/CopyElementToScreenButton';

let nextKey = 0;

export default class DesignProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement),
    elementIdList: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    onCopyElementToScreen: PropTypes.func.isRequired,
    onChangeElement: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  state = {selectedTab: TabType.PROPERTIES};

  /**
   * Handle a click on a tab, such as 'properties' or 'events'.
   * @param newTab {TabType} Tab to switch to.
   */
  handleTabClick = (newTab) => this.setState({selectedTab: newTab});

  render() {
    if (!this.props.element || !this.props.element.parentNode) {
      return <p>{applabMsg.designWorkspaceDescription()}</p>;
    }

    // We want to have a unique key that doesn't change when the element id
    // changes, and has no risk of collisions between elements. We add this to
    // the backing element using jquery.data(), which keeps its own per-session
    // store of data, without affecting the serialiazation
    let key = $(this.props.element).data('key');
    if (!key) {
      key = nextKey++;
      $(this.props.element).data('key', key);
    }

    const elementType = elementLibrary.getElementType(this.props.element);
    const PropertyComponent = elementLibrary.getElementPropertyTab(elementType);
    const EventComponent = elementLibrary.getElementEventTab(elementType);

    const isScreen = (elementType === elementLibrary.ElementType.SCREEN);
    // For now, limit duplication to just non-screen elements

    const onlyOneScreen = (this.props.screenIds.length === 1);

    // First screen is not deletable
    const isOnlyScreen = (isScreen && onlyOneScreen);

    const tabHeight = 35;
    const borderColor = color.lighter_gray;
    const bgColor = color.lightest_gray;

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

    const baseTabStyle = {
      borderColor: borderColor,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      height: tabHeight,
      padding: '0 10px'
    };

    /** @constant {Object} */
    const styles = {
      activeTab: Object.assign({}, baseTabStyle, {
        backgroundColor: bgColor,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        float: 'left'
      }),
      inactiveTab: Object.assign({}, baseTabStyle, {
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        float: 'left'
      }),
      // This tab should fill the remaining horizontal space.
      emptyTab: Object.assign({}, baseTabStyle, {
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
          <div
            id="propertiesTab"
            style={this.state.selectedTab === TabType.PROPERTIES ? styles.activeTab : styles.inactiveTab}
            className="hover-pointer"
            onClick={this.handleTabClick.bind(this, TabType.PROPERTIES)}
          >
            <span style={styles.tabLabel}>PROPERTIES</span>
          </div>
          <div
            id="eventsTab"
            style={this.state.selectedTab === TabType.EVENTS ? styles.activeTab : styles.inactiveTab}
            className="hover-pointer"
            onClick={this.handleTabClick.bind(this, TabType.EVENTS)}
          >
            <span style={styles.tabLabel}>EVENTS</span>
          </div>
          <div id="emptyTab" style={styles.emptyTab}>
            <ElementSelect
              onChangeElement={this.props.onChangeElement}
              elementIdList={this.props.elementIdList}
              selected={this.props.element}
            />
          </div>
        </div>
        <div id="designWorkspaceBody" style={styles.workspaceBody}>
          <div
            id="propertiesBody"
            style={this.state.selectedTab === TabType.PROPERTIES ? styles.activeBody : styles.inactiveBody}
          >
            {/* We provide a key to the outer div so that element foo and element bar are
               seen to be two completely different tables. Otherwise the defaultValues
               in inputs don't update correctly. */}
            <div key={key}>
              <div style={{float: 'right'}}>
                {!isOnlyScreen &&
                <DeleteElementButton
                  shouldConfirm={isScreen}
                  handleDelete={this.props.onDelete}
                />
                }
                <DuplicateElementButton handleDuplicate={this.props.onDuplicate}/>
                {!onlyOneScreen && !isScreen &&
                <CopyElementToScreenButton
                  handleCopyElementToScreen={this.props.onCopyElementToScreen}
                  screenIds={this.props.screenIds}
                />
                }
              </div>
              <PropertyComponent
                element={this.props.element}
                handleChange={this.props.handleChange}
                onDepthChange={this.props.onDepthChange}
              />
            </div>
          </div>
          <div
            id="eventsBody"
            style={this.state.selectedTab === TabType.EVENTS ? styles.activeBody : styles.inactiveBody}
          >
            <EventComponent
              element={this.props.element}
              handleChange={this.props.handleChange}
              onInsertEvent={this.props.onInsertEvent}
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * @readonly
 * @enum {string}
 */
const TabType = {
  PROPERTIES: 'properties',
  EVENTS: 'events'
};
DesignProperties.TabType = TabType;
