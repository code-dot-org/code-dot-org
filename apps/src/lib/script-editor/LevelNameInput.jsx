import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '../../templates/FontAwesome';

const styles = {
  levelSelect: {
    display: 'inline-block',
    verticalAlign: 'middle',
    width: 600
  },
  validIcon: {
    color: 'green',
    fontSize: 16,
    marginLeft: 6
  },
  invalidIcon: {
    color: 'red',
    fontSize: 16,
    marginLeft: 6
  },
  textInput: {
    width: 550,
    verticalAlign: 'baseline',
    marginBottom: 0
  }
};

export default class LevelNameInput extends Component {
  static propTypes = {
    onSelectLevel: PropTypes.func.isRequired,
    levelNameToIdMap: PropTypes.objectOf(PropTypes.number).isRequired,
    initialLevelName: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      levelName: props.initialLevelName
    };
  }

  handleLevelNameChange = levelName => {
    this.setState({levelName});
    const levelId = this.props.levelNameToIdMap[levelName];
    if (levelId) {
      this.props.onSelectLevel(levelId);
    }
  };

  render() {
    const {levelName} = this.state;
    const isValid = !!this.props.levelNameToIdMap[levelName];
    return (
      <span style={styles.levelSelect}>
        <input
          type="text"
          style={styles.textInput}
          onChange={e => this.handleLevelNameChange(e.target.value)}
          value={levelName}
        />
        {isValid ? (
          <FontAwesome icon={'check-circle'} style={styles.validIcon} />
        ) : (
          <FontAwesome icon={'times-circle'} style={styles.invalidIcon} />
        )}
      </span>
    );
  }
}
