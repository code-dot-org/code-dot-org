/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import Tutorial from './tutorial';
import TutorialDetail from './tutorialDetail';
import shapes from './shapes';
import i18n from './locale';

const styles = {
  tutorialSetNoTutorials: {
    backgroundColor: "#d6d6d6",
    padding: 20,
    margin: 60,
    whiteSpace: "pre-wrap"
  }
};

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    localeEnglish: React.PropTypes.bool.isRequired,
    disabledTutorials: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  getInitialState() {
    return {
      showingDetail: false,
      chosenItem: null
    };
  },

  tutorialClicked(item) {
    this.setState({showingDetail: true, chosenItem: item});
  },

  tutorialDetailClosed() {
    this.setState({showingDetail: false, chosenItem: null});
  },

  changeTutorial(delta) {
    const index = this.props.tutorials.indexOf(this.state.chosenItem);
    let nextItem = this.props.tutorials[index + delta];
    if (nextItem) {
      this.setState({showingDetail: true, chosenItem: nextItem});
    }
  },

  render() {
    const disabledTutorial = this.state.showingDetail &&
      this.props.disabledTutorials.indexOf(this.state.chosenItem.short_code) !== -1;

    return (
      <div>
        <TutorialDetail
          showing={this.state.showingDetail}
          item={this.state.chosenItem}
          closeClicked={this.tutorialDetailClosed}
          localeEnglish={this.props.localeEnglish}
          disabledTutorial={disabledTutorial}
          changeTutorial={this.changeTutorial}
        />
        {this.props.tutorials.map(item => (
          <Tutorial
            item={item}
            filters={this.props.filters}
            key={item.code}
            tutorialClicked={this.tutorialClicked.bind(this, item)}
          />
        ))}
        {this.props.tutorials.length === 0 && (
          <div style={styles.tutorialSetNoTutorials}>
            {i18n.tutorialSetNoTutorials()}
          </div>
        )}
      </div>
    );
  }
});

export default TutorialSet;
