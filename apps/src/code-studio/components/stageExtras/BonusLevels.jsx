import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Radium from 'radium';
import React, {PropTypes} from 'react';
import MazeThumbnail from './MazeThumbnail';
import CompletableLevelThumbnail from './CompletableLevelThumbnail';
import color from "../../../util/color";
import i18n from '@cdo/locale';
import { bonusLevel, stageOfBonusLevels } from './shapes';
import { connect } from 'react-redux';
import { isPerfect } from '@cdo/apps/code-studio/progressRedux';

const THUMBNAIL_IMAGE_SIZE = 200;
const THUMBNAIL_IMAGE_MARGIN = 10;
const RadiumFontAwesome = Radium(FontAwesome);

const styles = {
  bonusLevel: {
    width: THUMBNAIL_IMAGE_SIZE,
    textAlign: 'center',
    marginRight: THUMBNAIL_IMAGE_MARGIN,
    float: 'left',
  },
  bonusLevelsTitle: {
    fontSize: 24,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal,
  },
  challengeRow: {
    clear: 'both',
    overflow: 'hidden',
    display: 'inline-block',
    position: 'relative',
    whiteSpace: 'normal',
    transition: 'left 0.25s ease-out',
    paddingBottom: 10,
  },
  challenges: {
    display: 'inline-block',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'width 0.1s ease-out',
    verticalAlign: 'top',
  },
  solutionImage: {
    border: `1px solid ${color.lighter_gray}`,
    marginBottom: 5,
    width: 400,
    height: 400,
    maxWidth: 'initial',
  },
  stageNumberHeading: {
    textAlign: 'center',
  },
  arrow: {
    fontSize: 40,
    cursor: 'pointer',
    verticalAlign: -30,
  },
  arrowDisabled: {
    color: color.lighter_gray,
    cursor: 'default',
  },
};

class BonusLevelButton extends React.Component {
  static propTypes = {
    perfected: PropTypes.bool.isRequired,
  };

  render() {
    return this.props.perfected ?
      <button className="btn btn-large">{i18n.review()}</button> :
      <button className="btn btn-large btn-primary">{i18n.tryIt()}</button>;
  }
}

class BonusLevel extends React.Component {
  static propTypes = {
    ...bonusLevel,
    perfected: PropTypes.bool.isRequired,
  };

  renderWithMazeThumbnail() {
    return (
      <div style={styles.bonusLevel}>
        <a href={`?id=${this.props.id}`}>
          <CompletableLevelThumbnail
            size={THUMBNAIL_IMAGE_SIZE}
            completed={this.props.perfected}
          >
            <MazeThumbnail {...this.props}/>
          </CompletableLevelThumbnail>
          <BonusLevelButton perfected={this.props.perfected} />
        </a>
      </div>
    );
  }

  renderSolutionImageThumbnail() {
    return (
      <div style={styles.bonusLevel}>
        <a href={`?id=${this.props.id}`}>
          <CompletableLevelThumbnail
            size={THUMBNAIL_IMAGE_SIZE}
            completed={this.props.perfected}
          >
            <img
              src={this.props.solutionImageUrl}
              style={styles.solutionImage}
            />
          </CompletableLevelThumbnail>
          <BonusLevelButton perfected={this.props.perfected} />
        </a>
      </div>
    );
  }

  render() {
    if (["Maze", "Karel"].includes(this.props.type)) {
      return this.renderWithMazeThumbnail();
    } else if (this.props.solutionImageUrl) {
      return this.renderSolutionImageThumbnail();
    } else {
      return (
        <a href={`?id=${this.props.id}`}>{this.props.name}</a>
      );
    }
  }
}

const ConnectedBonusLevel = connect((state, ownProps) => ({
  perfected: isPerfect(state.progress, ownProps.levelId),
}))(BonusLevel);

export default Radium(class BonusLevels extends React.Component {
  static propTypes = {
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(stageOfBonusLevels)),
  };

  constructor(props) {
    super(props);
    this.state = {
      stageIndex: props.bonusLevels.length - 1,
    };
  }

  nextStage = () => {
    if (this.state.stageIndex < this.props.bonusLevels.length - 1) {
      this.setState({stageIndex: this.state.stageIndex + 1});
    }
  };

  previousStage = () => {
    if (this.state.stageIndex > 0) {
      this.setState({stageIndex: this.state.stageIndex - 1});
    }
  };

  render() {
    const totalThumbnailWidth = THUMBNAIL_IMAGE_SIZE + THUMBNAIL_IMAGE_MARGIN;
    const totalWidth = this.props.bonusLevels[this.state.stageIndex].levels.length *
      totalThumbnailWidth - THUMBNAIL_IMAGE_MARGIN;

    const levels = this.props.bonusLevels.filter(stage =>
      stage.stageNumber < this.props.bonusLevels[this.state.stageIndex].stageNumber
    ).reduce((numLevels, stage) => numLevels + stage.levels.length, 0);
    const scrollAmount = -1 * levels * totalThumbnailWidth;

    const leftDisabled = this.state.stageIndex === 0;
    const rightDisabled = this.state.stageIndex === this.props.bonusLevels.length - 1;
    return (
      <div>
        <h2 style={styles.bonusLevelsTitle}>{i18n.extrasTryAChallenge()}</h2>
        <RadiumFontAwesome
          icon="caret-left"
          onClick={this.previousStage}
          style={[
            styles.arrow,
            leftDisabled && styles.arrowDisabled,
          ]}
        />
        <div
          style={{
            ...styles.challenges,
            width: totalWidth,
          }}
        >
          {this.props.bonusLevels.map(stage =>
            <div
              key={stage.stageNumber}
              style={{
                ...styles.challengeRow,
                left: scrollAmount,
                width: stage.levels.length * totalThumbnailWidth,
              }}
            >
              <h3 style={styles.stageNumberHeading}>
                {i18n.extrasStageNChallenges({
                  stageNumber: this.props.bonusLevels[this.state.stageIndex].stageNumber
                })}
              </h3>
              {stage.levels.map(level => (
                <ConnectedBonusLevel key={level.id} {...level} />
              ))}
            </div>
          )}
        </div>
        <RadiumFontAwesome
          icon="caret-right"
          onClick={this.nextStage}
          style={[
            styles.arrow,
            rightDisabled && styles.arrowDisabled,
          ]}
        />
      </div>
    );
  }
});
