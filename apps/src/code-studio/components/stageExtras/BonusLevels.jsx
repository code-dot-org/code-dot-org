import React, {PropTypes} from 'react';
import MazeThumbnail from './MazeThumbnail';
import CompletableLevelThumbnail from './CompletableLevelThumbnail';
import color from "../../../util/color";
import i18n from '@cdo/locale';
import { bonusLevel } from './shapes';
import { connect } from 'react-redux';
import { isPerfect } from '@cdo/apps/code-studio/progressRedux';

const THUMBNAIL_IMAGE_SIZE = 200;

const styles = {
  bonusLevel: {
    width: THUMBNAIL_IMAGE_SIZE,
    textAlign: 'center',
    marginRight: 10,
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
  },
  solutionImage: {
    border: `1px solid ${color.lighter_gray}`,
    marginBottom: 5,
    width: 400,
    height: 400,
    maxWidth: 'initial',
  }
};

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
          <button className="btn btn-large btn-primary">{i18n.tryIt()}</button>
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
          <button className="btn btn-large btn-primary">{i18n.tryIt()}</button>
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

export default function BonusLevels(props) {
  return (
    <div>
      <h2 style={styles.bonusLevelsTitle}>{i18n.extrasTryAChallenge()}</h2>
      <div style={styles.challengeRow}>
        {props.bonusLevels.map(bonus => (<ConnectedBonusLevel key={bonus.id} {...bonus} />))}
      </div>
    </div>
  );
}

BonusLevels.propTypes = {
  bonusLevels: PropTypes.arrayOf(PropTypes.shape(bonusLevel)),
};
