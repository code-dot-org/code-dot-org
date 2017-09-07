import React from 'react';
import MazeThumbnail from './MazeThumbnail';
import CompletableLevelThumbnail from './CompletableLevelThumbnail';
import i18n from '@cdo/locale';
import { bonusLevel } from './shapes';
import color from "../../../util/color";

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
  }
};

class BonusLevel extends React.Component {
  static propTypes = bonusLevel;

  renderWithMazeThumbnail() {
    return (
      <div style={styles.bonusLevel}>
        <a href={`?id=${this.props.id}`}>
          <CompletableLevelThumbnail
            size={THUMBNAIL_IMAGE_SIZE}
            perfected={this.props.perfected}
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
          <img
            src={this.props.solutionImageUrl}
            width={THUMBNAIL_IMAGE_SIZE}
            height={THUMBNAIL_IMAGE_SIZE}
            style={styles.solutionImage}
          />
          <button className="btn btn-large btn-primary">{i18n.tryIt()}</button>
        </a>
      </div>
    );
  }

  render() {
    if (this.props.type === "Maze") {
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

export default function BonusLevels(props) {
  return (
    <div>
      <h2 style={styles.bonusLevelsTitle}>{i18n.extrasTryAChallenge()}</h2>
      <div style={styles.challengeRow}>
        {props.bonusLevels.map(bonus => (<BonusLevel key={bonus.id} {...bonus} />))}
      </div>
    </div>
  );
}

BonusLevels.propTypes = {
    bonusLevels: React.PropTypes.arrayOf(React.PropTypes.shape(bonusLevel)),
};
