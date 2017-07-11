import React from 'react';
import MazeThumbnail from './MazeThumbnail';
import i18n from '@cdo/locale';

const bonusLevel = {
  id: React.PropTypes.number.isRequired,
  map: React.PropTypes.array,
  name: React.PropTypes.string.isRequired,
  skin: React.PropTypes.string,
  startDirection: React.PropTypes.number,
  type: React.PropTypes.string.isRequired,
};

class BonusLevel extends React.Component {
  static propTypes = bonusLevel

  renderWithMazeThumbnail() {
    return (
      <div className="span3 offset1 text-center">
        <MazeThumbnail {...this.props} scale={0.6} />
        <a href={`?id=${this.props.id}`}>
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

export default function BonusLevels(props) { // eslint-disable-line react/no-multi-comp
  return (
    <div className="row">
      {props.bonusLevels.map(bonus => (<BonusLevel key={bonus.id} {...bonus} />))}
    </div>
  );
}

BonusLevels.propTypes = {
    bonusLevels: React.PropTypes.arrayOf(React.PropTypes.shape(bonusLevel)),
};
