/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import PropTypes from 'prop-types';
import React from 'react';
import Tutorial from './tutorial';
import TutorialDetail from './tutorialDetail';
import shapes from './shapes';
import i18n from '@cdo/tutorialExplorer/locale';

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export default class TutorialSet extends React.Component {
  static propTypes = {
    tutorials: PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    localeEnglish: PropTypes.bool.isRequired,
    disabledTutorials: PropTypes.arrayOf(PropTypes.string).isRequired,
    grade: PropTypes.string.isRequired,
  };

  state = {
    showingDetail: false,
    chosenItem: null,
  };

  tutorialClicked = item =>
    this.setState({showingDetail: true, chosenItem: item});

  tutorialDetailClosed = () => {
    // Okay, so while the tutorialDetail window is open, it's possible that the focus has changed.
    // The user could've hit left/right arrows while the detail was open and moved focus, or also could've
    // changed focus into the dialog, so before we wipe out the chosenItem, we find the associated
    // item in the tutorial list and focus it, and also make sure to scroll it into view because it's possible
    // the user navigated through enough of them to be off screen.
    const tutorialDiv = document.querySelectorAll(
      `[data-tutorial-code="${this.state.chosenItem.code}"]`
    )[0];

    this.setState({showingDetail: false, chosenItem: null}, () => {
      if (document.activeElement !== tutorialDiv) {
        setTimeout(() => {
          tutorialDiv.focus();
          if (!isInViewport(tutorialDiv)) {
            tutorialDiv.scrollIntoView({behavior: 'smooth', block: 'nearest'});
          }
        }, 0);
      }
    });
  };

  changeTutorial = delta => {
    const index = this.props.tutorials.indexOf(this.state.chosenItem);
    let nextItem = this.props.tutorials[index + delta];
    if (nextItem) {
      this.setState({showingDetail: true, chosenItem: nextItem});
    }
  };

  render() {
    const disabledTutorial =
      this.state.showingDetail &&
      this.props.disabledTutorials.indexOf(this.state.chosenItem.short_code) !==
        -1;

    return (
      <div>
        <TutorialDetail
          showing={this.state.showingDetail}
          item={this.state.chosenItem}
          closeClicked={this.tutorialDetailClosed}
          localeEnglish={this.props.localeEnglish}
          disabledTutorial={disabledTutorial}
          changeTutorial={this.changeTutorial}
          grade={this.props.grade}
        />
        {this.props.tutorials.map(item => (
          <Tutorial
            item={item}
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
}

const styles = {
  tutorialSetNoTutorials: {
    backgroundColor: '#d6d6d6',
    padding: 20,
    margin: 60,
    whiteSpace: 'pre-wrap',
  },
};
