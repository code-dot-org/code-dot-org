/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import PropTypes from 'prop-types';
import React from 'react';
import Tutorial from './tutorial';
import TutorialDetail from './tutorialDetail';
import shapes from './shapes';
import i18n from '@cdo/tutorialExplorer/locale';

export default class TutorialSet extends React.Component {
  static propTypes = {
    tutorials: PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    localeEnglish: PropTypes.bool.isRequired,
    disabledTutorials: PropTypes.arrayOf(PropTypes.string).isRequired,
    grade: PropTypes.string.isRequired
  };

  state = {
    showingDetail: false,
    chosenItem: null
  };

  tutorialClicked = item =>
    this.setState({showingDetail: true, chosenItem: item});

  tutorialDetailClosed = () => {
    // okay, so while the tutorialDetail window is open, it's possible that the focus has changed
    // the user could've hit left/right arrows while the detail was open and moved focus, or also could've
    // changed focus into the dialog, so before we wipe out the chosenItem, we find the associated
    // item in the tutorial list and focus it, and also make sure to scroll it into view because it's possible
    // the user navigated through enough of them to be off screen.
    const tutorialDiv = document.querySelectorAll(
      `[data-tutorial-code="${this.state.chosenItem.code}"]`
    )[0];
    if (
      document.activeElement.hasAttribute('data-tutorial-code)') &&
      document.activeElement !== tutorialDiv
    ) {
      // when in doubt, set timeout! _something_ is happening here that's fiddling with the focus, so we
      // just defer it to the next run through of the even loop. if you remove this, the focus call will
      // fail, although the scrollIntoView will work.
      setTimeout(() => {
        tutorialDiv.focus();
        tutorialDiv.scrollIntoView();
      }, 0);
    }

    this.setState({showingDetail: false, chosenItem: null});
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
    whiteSpace: 'pre-wrap'
  }
};
