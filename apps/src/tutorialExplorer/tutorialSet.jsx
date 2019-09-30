/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import PropTypes from 'prop-types';
import React from 'react';
import Tutorial from './tutorial';
import TutorialSpecificLocale from './tutorialSpecificLocale';
import TutorialDetail from './tutorialDetail';
import shapes from './shapes';
import i18n from '@cdo/tutorialExplorer/locale';

const styles = {
  tutorialSetNoTutorials: {
    backgroundColor: '#d6d6d6',
    padding: 20,
    margin: 60,
    whiteSpace: 'pre-wrap'
  }
};

export default class TutorialSet extends React.Component {
  static propTypes = {
    tutorials: PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    specificLocale: PropTypes.bool,
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

  tutorialDetailClosed = () =>
    this.setState({showingDetail: false, chosenItem: null});

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

    const TutorialComponent = this.props.specificLocale
      ? TutorialSpecificLocale
      : Tutorial;

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
          <TutorialComponent
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
