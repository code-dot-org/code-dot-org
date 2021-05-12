import PropTypes from 'prop-types';
import React, {Component} from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

const publishedStates = [
  //'In Development',
  'Pilot',
  'Preview',
  'Assignable',
  'Recommended'
];

export default class CourseVersionPublishedStateSelector extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    isStable: PropTypes.bool.isRequired,
    pilotExperiment: PropTypes.string,
    updateVisible: PropTypes.func.isRequired,
    updateIsStable: PropTypes.func.isRequired,
    updatePilotExperiment: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      publishedState: this.props.visible
        ? this.props.isStable
          ? 'Recommended'
          : 'Assignable'
        : this.props.pilotExperiment
        ? 'Pilot'
        : 'Preview',
      pilotExperiment: this.props.pilotExperiment
    };
  }

  handlePublishedStateChange = event => {
    const newPublishedState = event.target.value;
    switch (newPublishedState) {
      //case 'In Development':
      //break;
      case 'Pilot':
        this.setState({publishedState: newPublishedState}, () => {
          this.props.updatePilotExperiment(this.state.pilotExperiment);
          this.props.updateVisible(false);
          this.props.updateIsStable(false);
        });
        break;
      case 'Assignable':
        this.setState(
          {publishedState: newPublishedState, pilotExperiment: null},
          () => {
            this.props.updatePilotExperiment('');
            this.props.updateVisible(true);
            this.props.updateIsStable(false);
          }
        );
        break;
      case 'Recommended':
        this.setState(
          {publishedState: newPublishedState, pilotExperiment: null},
          () => {
            this.props.updatePilotExperiment('');
            this.props.updateVisible(true);
            this.props.updateIsStable(true);
          }
        );

        break;
      case 'Preview':
      default:
        this.setState(
          {publishedState: newPublishedState, pilotExperiment: null},
          () => {
            this.props.updatePilotExperiment('');
            this.props.updateVisible(false);
            this.props.updateIsStable(false);
          }
        );
        break;
    }
  };

  updatePilotExperiment = event => {
    const newPilotExperiment = event.target.value;
    this.setState({pilotExperiment: newPilotExperiment}, () => {
      this.props.updatePilotExperiment(newPilotExperiment);
    });
  };

  render() {
    return (
      <div>
        <label>
          Published State
          <select
            value={this.state.publishedState}
            style={styles.dropdown}
            onChange={this.handlePublishedStateChange}
          >
            {publishedStates.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        {this.state.publishedState === 'Pilot' && (
          <label>
            Pilot Experiment
            <HelpTip>
              <p>
                If specified, this course will only be accessible to
                levelbuilders, or to classrooms whose teacher is enrolled in
                this pilot experiment
              </p>
            </HelpTip>
            <input
              value={this.state.pilotExperiment}
              style={styles.input}
              onChange={this.updatePilotExperiment}
            />
          </label>
        )}
      </div>
    );
  }
}

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0
  },
  dropdown: {
    margin: '0 6px'
  }
};
