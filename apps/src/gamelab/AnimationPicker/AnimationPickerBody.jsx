/** Body of the animation picker dialog */
'use strict';

var AnimationPickerListItem = require('./AnimationPickerListItem.jsx');
var AnimationPickerSearchBar = require('./AnimationPickerSearchBar.jsx');
var gamelabMsg = require('../locale');
var Radium = require('radium');
var ScrollableList = require('../AnimationTab/ScrollableList.jsx');
var styles = require('./styles');
import animationLibrary from '../animationLibrary';

var AnimationPickerBody = React.createClass({
  propTypes: {
    onUploadClick: React.PropTypes.func.isRequired
  },

  render: function () {
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
          {animationLibrary.map(metadata =>
            <AnimationPickerListItem key={metadata.sourceUrl} {...metadata} />
          )}
        </ScrollableList>
      </div>
    );
  }
});
module.exports = Radium(AnimationPickerBody);
