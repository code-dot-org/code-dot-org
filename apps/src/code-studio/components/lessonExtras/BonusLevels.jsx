import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import MazeThumbnail from './MazeThumbnail';
import CompletableLevelThumbnail from './CompletableLevelThumbnail';
import color from '../../../util/color';
import i18n from '@cdo/locale';
import {bonusLevel, lessonOfBonusLevels} from './shapes';
import {connect} from 'react-redux';
import {isPerfect} from '@cdo/apps/code-studio/progressRedux';

const THUMBNAIL_IMAGE_SIZE = 200;
const THUMBNAIL_IMAGE_MARGIN = 10;
const RadiumFontAwesome = Radium(FontAwesome);

const styles = {
  bonusLevel: {
    width: THUMBNAIL_IMAGE_SIZE,
    textAlign: 'center',
    marginRight: THUMBNAIL_IMAGE_MARGIN,
    float: 'left'
  },
  bonusLevelsTitle: {
    fontSize: 24,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal
  },
  challengeRow: {
    clear: 'both',
    overflow: 'hidden',
    display: 'inline-block',
    position: 'relative',
    whiteSpace: 'normal',
    transition: 'left 0.25s ease-out',
    paddingBottom: 10
  },
  challenges: {
    display: 'inline-block',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'width 0.1s ease-out',
    verticalAlign: 'top'
  },
  solutionImage: {
    border: `1px solid ${color.lighter_gray}`,
    marginBottom: 5,
    width: 400,
    height: 400,
    maxWidth: 'initial'
  },
  lessonNumberHeading: {
    textAlign: 'center'
  },
  arrow: {
    fontSize: 40,
    cursor: 'pointer',
    verticalAlign: -30
  },
  arrowDisabled: {
    color: color.lighter_gray,
    cursor: 'default'
  }
};

class BonusLevelButton extends React.Component {
  static propTypes = {
    perfected: PropTypes.bool.isRequired
  };

  render() {
    return this.props.perfected ? (
      <button type="button" className="btn btn-large">
        {i18n.review()}
      </button>
    ) : (
      <button type="button" className="btn btn-large btn-primary">
        {i18n.tryIt()}
      </button>
    );
  }
}

class BonusLevel extends React.Component {
  static propTypes = {
    ...bonusLevel,
    perfected: PropTypes.bool.isRequired,
    sectionId: PropTypes.number,
    userId: PropTypes.number
  };

  getQueryString = () => {
    const {id, sectionId, userId} = this.props;
    let url = `?id=${id}`;
    if (sectionId && userId) {
      // Both sectionId and userId are required to link to a student's work on a bonus level.
      url += `&section_id=${sectionId}&user_id=${userId}`;
    } else if (sectionId) {
      url += `&section_id=${sectionId}`;
    }
    return url;
  };

  renderWithMazeThumbnail() {
    return (
      <div style={styles.bonusLevel}>
        <a href={this.getQueryString()}>
          <CompletableLevelThumbnail
            size={THUMBNAIL_IMAGE_SIZE}
            completed={this.props.perfected}
          >
            <MazeThumbnail {...this.props} />
          </CompletableLevelThumbnail>
          <BonusLevelButton perfected={this.props.perfected} />
        </a>
      </div>
    );
  }

  renderSolutionImageThumbnail(src) {
    return (
      <div style={styles.bonusLevel}>
        <a href={this.getQueryString()}>
          <CompletableLevelThumbnail
            size={THUMBNAIL_IMAGE_SIZE}
            completed={this.props.perfected}
          >
            <img src={src} style={styles.solutionImage} />
          </CompletableLevelThumbnail>
          <BonusLevelButton perfected={this.props.perfected} />
        </a>
      </div>
    );
  }

  render() {
    if (this.props.thumbnailUrl) {
      return this.renderSolutionImageThumbnail(this.props.thumbnailUrl);
    } else if (['Maze', 'Karel'].includes(this.props.type)) {
      return this.renderWithMazeThumbnail();
    } else if (this.props.solutionImageUrl) {
      return this.renderSolutionImageThumbnail(this.props.solutionImageUrl);
    } else {
      return <a href={this.getQueryString()}>{this.props.name}</a>;
    }
  }
}

const ConnectedBonusLevel = connect((state, ownProps) => ({
  perfected: isPerfect(state.progress, ownProps.levelId)
}))(BonusLevel);

export default Radium(
  class BonusLevels extends React.Component {
    static propTypes = {
      bonusLevels: PropTypes.arrayOf(PropTypes.shape(lessonOfBonusLevels)),
      sectionId: PropTypes.number,
      userId: PropTypes.number
    };

    constructor(props) {
      super(props);
      this.state = {
        lessonIndex: props.bonusLevels.length - 1
      };
    }

    nextLesson = () => {
      if (this.state.lessonIndex < this.props.bonusLevels.length - 1) {
        this.setState({lessonIndex: this.state.lessonIndex + 1});
      }
    };

    previousLesson = () => {
      if (this.state.lessonIndex > 0) {
        this.setState({lessonIndex: this.state.lessonIndex - 1});
      }
    };

    render() {
      const totalThumbnailWidth = THUMBNAIL_IMAGE_SIZE + THUMBNAIL_IMAGE_MARGIN;
      const totalWidth =
        this.props.bonusLevels[this.state.lessonIndex].levels.length *
          totalThumbnailWidth -
        THUMBNAIL_IMAGE_MARGIN;

      const levels = this.props.bonusLevels
        .filter(
          lesson =>
            lesson.stageNumber <
            this.props.bonusLevels[this.state.lessonIndex].stageNumber
        )
        .reduce((numLevels, lesson) => numLevels + lesson.levels.length, 0);
      const scrollAmount = -1 * levels * totalThumbnailWidth;

      const leftDisabled = this.state.lessonIndex === 0;
      const rightDisabled =
        this.state.lessonIndex === this.props.bonusLevels.length - 1;
      return (
        <div>
          <h2 style={styles.bonusLevelsTitle}>{i18n.extrasTryAChallenge()}</h2>
          <RadiumFontAwesome
            icon="caret-left"
            onClick={this.previousLesson}
            style={[styles.arrow, leftDisabled && styles.arrowDisabled]}
          />
          <div
            style={{
              ...styles.challenges,
              width: totalWidth
            }}
          >
            {this.props.bonusLevels.map(lesson => (
              <div
                key={lesson.stageNumber}
                style={{
                  ...styles.challengeRow,
                  left: scrollAmount,
                  width: lesson.levels.length * totalThumbnailWidth
                }}
              >
                <h3 style={styles.lessonNumberHeading}>
                  {i18n.extrasStageNChallenges({
                    stageNumber: this.props.bonusLevels[this.state.lessonIndex]
                      .stageNumber
                  })}
                </h3>
                {lesson.levels.map(level => (
                  <ConnectedBonusLevel
                    key={level.id}
                    {...level}
                    sectionId={this.props.sectionId}
                    userId={this.props.userId}
                  />
                ))}
              </div>
            ))}
          </div>
          <RadiumFontAwesome
            icon="caret-right"
            onClick={this.nextLesson}
            style={[styles.arrow, rightDisabled && styles.arrowDisabled]}
          />
        </div>
      );
    }
  }
);
