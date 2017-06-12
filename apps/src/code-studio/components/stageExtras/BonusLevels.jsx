import React from 'react';

export default class BonusLevels extends React.Component {
  static propTypes = {
    bonusLevels: React.PropTypes.array,
  }

  render() {
    return (
      <div>
        {this.props.bonusLevels.map((bonus, index) => (
          <div key={index}>
            <a href={`?id=${bonus.id}`}>{bonus.name}</a>
          </div>
        ))}
      </div>
    );
  }
}
