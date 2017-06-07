import React from 'react';

export default class BonusLevels extends React.Component {
  static propTypes = {
    bonusLevels: React.PropTypes.array,
  }

  render() {
    return (
      <div>
        {this.props.bonusLevels.map(bonus => (
          <div>
            <a href="#">{bonus.name}</a>
          </div>
        ))}
      </div>
    );
  }
}
