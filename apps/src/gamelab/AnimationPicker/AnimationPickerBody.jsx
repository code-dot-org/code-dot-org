/** Body of the animation picker dialog */
'use strict';

import React from 'react';
import Radium from 'radium';
import gamelabMsg from '../locale';
import animationLibrary from '../animationLibrary';
import { getLabel } from '../animationMetadata';
import ScrollableList from '../AnimationTab/ScrollableList.jsx';
import styles from './styles';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import AnimationPickerSearchBar from './AnimationPickerSearchBar.jsx';

const AnimationPickerBody = React.createClass({
  propTypes: {
    onPickLibraryAnimation: React.PropTypes.func.isRequired,
    onUploadClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <h1 style={styles.title}>
          {gamelabMsg.animationPicker_title()}
        </h1>
        <AnimationPickerSearchBar />
        <ScrollableList style={{maxHeight: 400}}> {/* TODO: Is this maxHeight appropriate? */}
          <AnimationPickerListItem
              label={gamelabMsg.animationPicker_drawYourOwn()}
              icon="pencil"
          />
          <AnimationPickerListItem
              label={gamelabMsg.animationPicker_uploadImage()}
              icon="upload"
              onClick={this.props.onUploadClick}
          />
          {animationLibrary.map(animation =>
            <AnimationPickerListItem
                key={animation.sourceUrl}
                label={getLabel(animation)}
                animation={animation}
                onClick={this.props.onPickLibraryAnimation.bind(this, animation)}
            />
          )}
        </ScrollableList>
      </div>
    );
  }
});
export default Radium(AnimationPickerBody);
