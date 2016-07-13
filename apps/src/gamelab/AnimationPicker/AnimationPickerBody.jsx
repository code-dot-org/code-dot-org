/** Body of the animation picker dialog */
'use strict';

import React from 'react';
import Radium from 'radium';
import color from '../../color';
import gamelabMsg from '../locale';
import animationLibrary from '../animationLibrary';
import ScrollableList from '../AnimationTab/ScrollableList.jsx';
import styles from './styles';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import AnimationPickerSearchBar from './AnimationPickerSearchBar.jsx';

const AnimationPickerBody = React.createClass({
  propTypes: {
    is13Plus: React.PropTypes.bool,
    onDrawYourOwnClick: React.PropTypes.func.isRequired,
    onPickLibraryAnimation: React.PropTypes.func.isRequired,
    onUploadClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <h1 style={styles.title}>
          {gamelabMsg.animationPicker_title()}
        </h1>
        {this.props.is13Plus ||
          <WarningLabel>
            {gamelabMsg.animationPicker_warning()}
          </WarningLabel>
        }
        <AnimationPickerSearchBar />
        <ScrollableList style={{maxHeight: 400}}> {/* TODO: Is this maxHeight appropriate? */}
          <AnimationPickerListItem
              label={gamelabMsg.animationPicker_drawYourOwn()}
              icon="pencil"
              onClick={this.props.onDrawYourOwnClick}
          />
          <AnimationPickerListItem
              label={gamelabMsg.animationPicker_uploadImage()}
              icon="upload"
              onClick={this.props.onUploadClick}
          />
          {animationLibrary.map(animationProps =>
            <AnimationPickerListItem
                key={animationProps.sourceUrl}
                label={`${animationProps.name} (${animationProps.frameCount})`}
                animationProps={animationProps}
                onClick={this.props.onPickLibraryAnimation.bind(this, animationProps)}
            />
          )}
        </ScrollableList>
      </div>
    );
  }
});
export default Radium(AnimationPickerBody);

const WarningLabel = ({children}) => (
    <span style={warningLabelStyle}>
      {children}
    </span>
);
WarningLabel.propTypes = {
  children: React.PropTypes.node
};
const warningLabelStyle = {
  color: color.red
};
