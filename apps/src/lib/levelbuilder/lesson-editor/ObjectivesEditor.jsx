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
    objectives: PropTypes.arrayOf(PropTypes.object)
  };

  constructor(props) {
    super(props);

    this.state = {
      objectives: props.objectives || [],
      objectiveInput: '',
      currentlyEditingIndex: null
    };
  }

  handleRemove = idx => {
    let {objectives} = this.state;
    objectives.splice(idx, 1);
    this.setState({objectives});
  };

  handleEdit = idx => {
    this.setState({
      currentlyEditingIndex: idx,
      objectiveInput: this.state.objectives[idx].description
    });
  };

  handleCancel = () => {
    let {objectives, objectiveInput, currentlyEditingIndex} = this.state;
    if (
      objectiveInput === '' &&
      currentlyEditingIndex === objectives.length - 1
    ) {
      objectives.splice(objectives.length - 1, 1);
    }
    this.setState({
      objectives,
      objectiveInput: '',
      currentlyEditingIndex: null
    });
  };

  handleSave = () => {
    let {objectives, objectiveInput, currentlyEditingIndex} = this.state;
    objectives[currentlyEditingIndex].description = objectiveInput;
    this.setState({
      objectives,
      objectiveInput: '',
      currentlyEditingIndex: null
    });
  };

  addObjective = () => {
    let {objectives} = this.state;
    objectives.push({description: '', id: null});
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
                <tr key={index} style={index % 2 === 1 ? styles.oddRow : {}}>
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
