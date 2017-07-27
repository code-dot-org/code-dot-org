import React from 'react';
import MazeThumbnail from './MazeThumbnail';
import CompletableLevelThumbnail from './CompletableLevelThumbnail';
import i18n from '@cdo/locale';
import { bonusLevel } from './shapes';

const styles = {
  bonusLevel: {
    width: 200,
    textAlign: 'center',
    marginRight: 10,
    float: 'left',
  },
  challengeRow: {
    clear: 'both',
    overflow: 'hidden',
  },
};

class BonusLevel extends React.Component {
  static propTypes = bonusLevel;

  renderWithMazeThumbnail() {
    return (
      <div style={styles.bonusLevel}>
        <a href={`?id=${this.props.id}`}>
          <CompletableLevelThumbnail
            size={200}
            perfected={this.props.perfected}
          >
            <MazeThumbnail {...this.props}/>
          </CompletableLevelThumbnail>
          <button className="btn btn-large btn-primary">{i18n.tryIt()}</button>
        </a>
      </div>
    );
  }

  render() {
    if (this.props.type === "Maze") {
      return this.renderWithMazeThumbnail();
    } else {
      return (
        <a href={`?id=${this.props.id}`}>{this.props.name}</a>
      );
    }
  }
}

export default function BonusLevels(props) {
  return (
    <div style={styles.challengeRow}>
      {props.bonusLevels.map(bonus => (<BonusLevel key={bonus.id} {...bonus} />))}
    </div>
  );
}

BonusLevels.propTypes = {
    bonusLevels: React.PropTypes.arrayOf(React.PropTypes.shape(bonusLevel)),
};
