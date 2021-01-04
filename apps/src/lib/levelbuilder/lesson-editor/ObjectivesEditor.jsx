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

class ObjectiveLine extends React.Component {
  static propTypes = {
    editing: PropTypes.bool,
    description: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    lineStyle: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      description: props.description
    };
  }

  handleClickOutside = evt => {
    if (this.state.currentlyEditingIndex) {
      this.props.onSave(this.state.description);
    }
  };

  handleCancelClick = e => {
    this.setState({description: this.props.description});
    this.props.onEditCancel();
  };

  render() {
    return (
      <tr style={this.props.lineStyle}>
        <td style={{height: 30}}>
          {this.props.editing ? (
            <input
              value={this.state.description}
              onChange={e =>
                this.setState({
                  description: e.target.value
                })
              }
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  this.props.onSave(this.state.description);
                }
              }}
              style={{
                width: '98%'
              }}
              type="text"
            />
          ) : (
            <div>{this.state.description}</div>
          )}
        </td>
        {this.props.editing ? (
          <td style={styles.actionButtons}>
            <div
              style={styles.save}
              onMouseDown={() => this.props.onSave(this.state.description)}
            >
              <i className="fa fa-check" />
            </div>
            <div style={styles.remove} onMouseDown={this.handleCancelClick}>
              <i className="fa fa-times" />
            </div>
          </td>
        ) : (
          <td style={styles.actionButtons}>
            <div style={styles.edit} onMouseDown={this.props.onEditClick}>
              <i className="fa fa-edit" />
            </div>
            <div style={styles.remove} onMouseDown={this.props.onRemove}>
              <i className="fa fa-trash" />
            </div>
          </td>
        )}
      </tr>
    );
  }
}

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
    console.log('here');
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
    console.log(this.props.objectives);
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
                  lineStyle={index % 2 === 1 ? styles.oddRow : {}}
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
