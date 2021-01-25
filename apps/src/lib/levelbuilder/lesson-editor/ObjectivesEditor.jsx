import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import ObjectiveLine from './ObjectiveLine';

const styles = {
  addButton: {
    background: color.cyan,
    borderRadius: 3,
    color: color.white,
    fontSize: 14,
    padding: 7,
    textAlign: 'center',
    marginTop: 10,
    marginLeft: 0
  }
};

export default class ObjectivesEditor extends Component {
  static propTypes = {
    objectives: PropTypes.arrayOf(PropTypes.object).isRequired,
    updateObjectives: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      currentlyEditingIndex: null
    };
  }

  generateNewObjectiveKey = () => {
    let newKey = this.props.objectives.length + 1;
    while (
      this.props.objectives.some(
        objective => objective.key === `objective-${newKey}`
      )
    ) {
      newKey++;
    }
    return `objective-${newKey}`;
  };

  handleRemove = idx => {
    this.props.updateObjectives(
      this.props.objectives.filter((o, i) => i !== idx)
    );
  };

  handleEdit = idx => {
    this.setState({
      currentlyEditingIndex: idx
    });
  };

  handleCancel = () => {
    let {currentlyEditingIndex} = this.state;
    let {objectives} = this.props;
    if (
      objectives[currentlyEditingIndex].description === '' &&
      currentlyEditingIndex === objectives.length - 1
    ) {
      this.props.updateObjectives(objectives.slice(0, objectives.length - 1));
    }
    this.setState({
      currentlyEditingIndex: null
    });
  };

  handleSave = newDescription => {
    let {currentlyEditingIndex} = this.state;
    let {objectives} = this.props;
    const newObjectives = [...objectives];
    newObjectives[currentlyEditingIndex] = {
      ...objectives[currentlyEditingIndex],
      description: newDescription
    };
    this.props.updateObjectives(newObjectives);
    this.setState({
      currentlyEditingIndex: null
    });
  };

  addObjective = () => {
    let {objectives} = this.props;
    const newObjectiveKey = this.generateNewObjectiveKey();
    this.props.updateObjectives(
      objectives.concat([{description: '', key: newObjectiveKey}])
    );
    this.setState({
      currentlyEditingIndex: objectives.length
    });
  };

  render() {
    return (
      <div>
        <input
          type="hidden"
          name="objectives"
          value={JSON.stringify(this.props.objectives)}
        />
        <div style={styles.objectiveBox}>
          <table style={{width: '100%'}}>
            <thead>
              <tr>
                <th
                  style={{
                    width: '90%'
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    width: '30%'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {this.props.objectives.map((objective, index) => (
                <ObjectiveLine
                  key={objective.key}
                  description={objective.description}
                  onSave={this.handleSave}
                  onEditCancel={this.handleCancel}
                  onEditClick={() => this.handleEdit(index)}
                  onRemove={() => this.handleRemove(index)}
                  editing={this.state.currentlyEditingIndex === index}
                />
              ))}
            </tbody>
          </table>
        </div>
        <button
          onMouseDown={this.addObjective}
          style={styles.addButton}
          type="button"
        >
          <i className="fa fa-plus" style={{marginRight: 7}} /> Objective
        </button>
      </div>
    );
  }
}
