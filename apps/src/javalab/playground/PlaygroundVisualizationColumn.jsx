import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import PreviewPaneHeader from '../PreviewPaneHeader';
import classNames from 'classnames';
import {toggleVisualizationCollapsed} from '../javalabRedux';
import PlaygroundImage from './PlaygroundImage';
import PlaygroundText from './PlaygroundText';
import {PlaygroundItemType} from '../constants';

class PlaygroundVisualizationColumn extends React.Component {
  static propTypes = {
    // populated by redux
    isReadOnlyWorkspace: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    toggleVisualizationCollapsed: PropTypes.func,
    playgroundItemData: PropTypes.object,
    isResponsive: PropTypes.bool.isRequired
  };

  state = {
    isFullscreen: false
  };

  getItems() {
    const {playgroundItemData} = this.props;
    const items = Object.keys(playgroundItemData).map(itemId => {
      const itemData = playgroundItemData[itemId];
      if (itemData.type === PlaygroundItemType.IMAGE) {
        return <PlaygroundImage key={itemId} id={itemId} {...itemData} />;
      } else if (itemData.type === PlaygroundItemType.TEXT) {
        return <PlaygroundText key={itemId} id={itemId} {...itemData} />;
      }
    });
    return items;
  }

  render() {
    const {
      isReadOnlyWorkspace,
      isCollapsed,
      toggleVisualizationCollapsed
    } = this.props;
    const {isFullscreen} = this.state;

    const opacity = isCollapsed ? 0 : 1;
    const items = this.getItems();

    return (
      <div>
        <PreviewPaneHeader
          isCollapsed={isCollapsed}
          isFullscreen={isFullscreen}
          showAssetManagerButton
          disableAssetManagerButton={isReadOnlyWorkspace}
          showPreviewTitle={false}
          toggleVisualizationCollapsed={toggleVisualizationCollapsed}
        />
        <div style={{...styles.playgroundPreviewBackground, opacity}}>
          <div
            className={classNames({responsive: this.props.isResponsive})}
            id="visualization"
          >
            <div id="playground-container" style={styles.playground}>
              <img
                id="playground-background"
                style={styles.playgroundBackground}
              />
              <div id="playground" style={styles.playgroundDiv}>
                {items}
              </div>
              <audio id="playground-audio" autoPlay={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  playground: {
    width: 800,
    height: 800,
    overflow: 'hidden'
  },
  playgroundDiv: {
    width: 800,
    height: 800,
    overflow: 'hidden'
  },
  playgroundBackground: {
    position: 'absolute',
    width: 800,
    height: 800,
    top: 0,
    left: 0,
    opacity: 0,
    zIndex: -1
  },
  playgroundPreviewBackground: {
    backgroundImage: 'url("/blockly/media/javalab/Playground.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'top'
  }
};

export default connect(
  state => ({
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isCollapsed: state.javalab.isVisualizationCollapsed,
    playgroundItemData: state.playground.itemData,
    isResponsive: state.pageConstants.isResponsive
  }),
  dispatch => ({
    toggleVisualizationCollapsed() {
      dispatch(toggleVisualizationCollapsed());
    }
  })
)(PlaygroundVisualizationColumn);
