import PropTypes from 'prop-types';
import React, {Component} from 'react';
import 'react-select/dist/react-select.css';
import color from '@cdo/apps/util/color';

const styles = {
  resourceSearch: {
    paddingBottom: 10
  },
  resourceBox: {
    border: '1px solid ' + color.light_gray,
    padding: 10,
    marginTop: 10,
    marginBottom: 10
  },
  oddRow: {
    backgroundColor: color.lightest_gray
  },

  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center'
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
        Objectives
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
                <th style={{width: '10%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.objectives.map((objective, index) => (
                <tr key={index} style={index % 2 === 1 ? styles.oddRow : {}}>
                  <td>
                    {this.state.currentlyEditingIndex === index ? (
                      <input
                        value={this.state.objectiveInput}
                        onChange={e =>
                          this.setState({objectiveInput: e.target.value})
                        }
                      />
                    ) : (
                      <div>{objective.description}</div>
                    )}
                  </td>
                  <td style={{backgroundColor: 'white'}}>
                    {this.state.currentlyEditingIndex === index && (
                      <div style={styles.save} onMouseDown={this.handleSave}>
                        <i className="fa fa-check" />
                      </div>
                    )}
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
                      <i className="fa fa-times" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div onMouseDown={this.addObjective}>Add new objective</div>
        </div>
      </div>
    );
  }
}
