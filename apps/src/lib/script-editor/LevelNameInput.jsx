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
  }
};

export default class LevelNameInput extends Component {
  static propTypes = {
    onSelectLevel: PropTypes.func.isRequired,
    levelNameMap: PropTypes.objectOf(PropTypes.number).isRequired,
    levelId: PropTypes.number.isRequired,
    initialLevelName: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      isValid: props.levelId !== -1,
      levelName: props.initialLevelName
    };
  }

  handleLevelNameChange = levelName => {
    this.setState({levelName});
    const levelId = this.props.levelNameMap[levelName];
    if (levelId) {
      this.setState({isValid: true});
      this.props.onSelectLevel(levelId);
    } else {
      this.setState({isValid: false});
    }
  };

  render() {
    const {isValid, levelName} = this.state;
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
