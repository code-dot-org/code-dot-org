/* eslint-disable react/no-danger */
import React, { PropTypes } from 'react';
import ProgressLevelSet from './ProgressLevelSet';
import ProgressBubbleSet from './ProgressBubbleSet';
import { levelType } from './progressTypes';
import { progressionsFromLevels } from '@cdo/apps/code-studio/progressRedux';
import marked from 'marked';
import renderer from '@cdo/apps/util/StylelessRenderer';

const styles = {
  summary: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
  }
};

export default class ProgressLessonContent extends React.Component {
  static propTypes = {
    description: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.string,
  };

  render() {
    const { description, levels, disabled, selectedSectionId } = this.props;
    const progressions = progressionsFromLevels(levels);

    let bubbles;
    if (progressions.length === 1 && !progressions[0].name) {
      bubbles = (
        <ProgressBubbleSet
          levels={progressions[0].levels}
          disabled={disabled}
          selectedSectionId={selectedSectionId}
        />
      );
    } else {
      bubbles = (
        progressions.map((progression, index) => (
          <ProgressLevelSet
            key={index}
            name={progression.name}
            levels={progression.levels}
            disabled={disabled}
            selectedSectionId={selectedSectionId}
          />
        ))
      );
    }

    // We use dangerouslySetInnerHTML, but depend on our server markdown renderer
    // not providing for support for most markdown features (backticks being the
    // exception). As such, we should not end up with actually dangerous markdown
    // here.
    return (
      <div>
        <div
          style={styles.summary}
          dangerouslySetInnerHTML={{ __html: marked(description || '', { renderer }) }}
        />
        {bubbles}
      </div>
    );
  }
}
