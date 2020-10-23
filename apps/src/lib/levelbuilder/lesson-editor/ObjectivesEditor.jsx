import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';

const styles = {
  oddRow: {
    backgroundColor: color.lightest_gray
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    height: 30
  },
  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: '50%',
    lineHeight: '30px'
  },
  edit: {
    fontSize: 14,
    color: 'white',
    background: color.default_blue,
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: '50%',
    lineHeight: '30px'
  },
  save: {
    fontSize: 14,
    color: 'white',
    background: color.green,
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: '50%',
    lineHeight: '30px'
  },
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
    objectives: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      objectives: props.objectives,
      objectiveInput: '',
      currentlyEditingIndex: null
    };
  }

  generateNewObjectiveKey = () => {
    let newKey = this.state.objectives.length + 1;
    while (
      this.state.objectives.some(
        objective => objective.key === `objective-${newKey}`
      )
    ) {
      newKey++;
    }
    return `objective-${newKey}`;
  };

  handleRemove = idx => {
    let {objectives} = this.state;
    objectives = objectives.filter((o, i) => i !== idx);
    this.setState({objectives});
  };

  handleEdit = idx => {
    this.setState({
      currentlyEditingIndex: idx,
      objectiveInput: this.state.objectives[idx].description
    });
  };

  handleCancel = () => {
    let {objectives, currentlyEditingIndex} = this.state;
    if (
      objectives[currentlyEditingIndex].description === '' &&
      currentlyEditingIndex === objectives.length - 1
    ) {
      objectives = objectives.slice(0, objectives.length - 1);
    }
    this.setState({
      objectives,
      objectiveInput: '',
      currentlyEditingIndex: null
    });
  };

  handleSave = () => {
    let {objectives, objectiveInput, currentlyEditingIndex} = this.state;
    const newObjectives = [...objectives];
    newObjectives[currentlyEditingIndex] = {
      ...objectives[currentlyEditingIndex],
      description: objectiveInput
    };
    this.setState({
      objectives: newObjectives,
      objectiveInput: '',
      currentlyEditingIndex: null
    });
  };

  addObjective = () => {
    let {objectives} = this.state;
    const newObjectiveKey = this.generateNewObjectiveKey();
    objectives = objectives.concat([{description: '', key: newObjectiveKey}]);
    this.setState({
      objectives,
      currentlyEditingIndex: objectives.length - 1,
      objectiveInput: ''
    });
  };

  render() {
    return (
      <div>
        <input
          type="hidden"
          name="objectives"
          value={JSON.stringify(this.state.objectives)}
        />
        <div style={styles.objectiveBox}>
          <table style={{width: '100%'}}>
            <thead>
              <tr>
                <th style={{width: '90%'}}>Description</th>
                <th style={{width: '30%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.objectives.map((objective, index) => (
                <tr
                  key={objective.key}
                  style={index % 2 === 1 ? styles.oddRow : {}}
                >
                  <td style={{height: 30}}>
                    {this.state.currentlyEditingIndex === index ? (
                      <input
                        value={this.state.objectiveInput}
                        onChange={e =>
                          this.setState({objectiveInput: e.target.value})
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            this.handleSave();
                          }
                        }}
                        style={{width: '98%'}}
                        type="text"
                      />
                    ) : (
                      <div>{objective.description}</div>
                    )}
                  </td>
                  {this.state.currentlyEditingIndex === index ? (
                    <td style={styles.actionButtons}>
                      <div style={styles.save} onMouseDown={this.handleSave}>
                        <i className="fa fa-check" />
                      </div>
                      <div
                        style={styles.remove}
                        onMouseDown={this.handleCancel}
                      >
                        <i className="fa fa-times" />
                      </div>
                    </td>
                  ) : (
                    <td style={styles.actionButtons}>
                      <div
                        style={styles.edit}
                        onMouseDown={() => this.handleEdit(index)}
                      >
                        <i className="fa fa-edit" />
                      </div>
                      <div
                        style={styles.remove}
                        onMouseDown={() => this.handleRemove(index)}
                      >
                        <i className="fa fa-trash" />
                      </div>
                    </td>
                  )}
                </tr>
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
