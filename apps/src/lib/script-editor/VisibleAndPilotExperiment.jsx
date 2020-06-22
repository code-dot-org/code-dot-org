import PropTypes from 'prop-types';
import React from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4
  },
  checkbox: {
    margin: '0 0 0 7px'
  }
};

/**
 * Component which renders two input fields: a checkbox which controls whether the course/script
 * should be available in the dropdown on Teacher Dashboard, and a text field which controls whether
 * the course/script is in a pilot experiment. This component also ensures that if there is a pilot experiment,
 * then the visible checkbox will be unchecked and greyed out, to maintain consistency between the two.
 */
export default class VisibleAndPilotExperiment extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    pilotExperiment: PropTypes.string,
    paramName: PropTypes.string
  };

  static defaultProps = {
    paramName: 'visible_to_teachers'
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: this.props.visible,
      pilotExperiment: this.props.pilotExperiment
    };
  }

  render() {
    return (
      <div>
        <VisibleInTeacherDashboard
          checked={this.state.visible}
          disabled={!!this.state.pilotExperiment}
          onChange={e => this.setState({visible: e.target.checked})}
          paramName={this.props.paramName}
        />
        <PilotExperiment
          value={this.state.pilotExperiment}
          onChange={e => this.setState({pilotExperiment: e.target.value})}
        />
      </div>
    );
  }
}

const VisibleInTeacherDashboard = props => (
  <label style={props.disabled ? {opacity: 0.5} : {}}>
    Visible in Teacher Dashboard
    <input
      name={props.paramName}
      type="checkbox"
      disabled={props.disabled}
      checked={props.checked && !props.disabled}
      onChange={props.onChange}
      style={styles.checkbox}
    />
    <HelpTip>
      <p>
        If checked this script will show up in the dropdown on the Teacher
        Dashboard, for teachers to assign to students.
        {props.disabled && (
          <em>Disabled because a pilot experiment has been specified below.</em>
        )}
      </p>
    </HelpTip>
  </label>
);
VisibleInTeacherDashboard.propTypes = {
  paramName: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

const PilotExperiment = props => (
  <label>
    Pilot Experiment
    <HelpTip>
      <p>
        If specified, this script will only be accessible to levelbuilders, or
        to classrooms whose teacher has this user experiment enabled.
      </p>
    </HelpTip>
    <input
      name="pilot_experiment"
      value={props.value || ''}
      style={styles.input}
      onChange={props.onChange}
    />
  </label>
);
PilotExperiment.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};
