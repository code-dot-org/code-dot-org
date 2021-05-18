import PropTypes from 'prop-types';
import React, {Component} from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import color from '@cdo/apps/util/color';

const publishedStates = ['Pilot', 'Beta', 'Preview', 'Recommended'];

export default class CourseVersionPublishingEditor extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    isStable: PropTypes.bool.isRequired,
    pilotExperiment: PropTypes.string,
    versionYear: PropTypes.string,
    familyName: PropTypes.string,
    updateVisible: PropTypes.func.isRequired,
    updateIsStable: PropTypes.func.isRequired,
    updatePilotExperiment: PropTypes.func.isRequired,
    updateFamilyName: PropTypes.func.isRequired,
    updateVersionYear: PropTypes.func.isRequired,
    families: PropTypes.arrayOf(PropTypes.string).isRequired,
    versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isCourse: PropTypes.bool,
    publishedState: PropTypes.string.isRequired,
    updatePublishedState: PropTypes.func.isRequired
  };

  handlePublishedStateChange = event => {
    const newPublishedState = event.target.value;
    this.props.updatePublishedState(newPublishedState);
    switch (newPublishedState) {
      case 'Pilot':
        this.props.updateVisible(false);
        this.props.updateIsStable(false);
        break;
      case 'Preview':
        this.props.updatePilotExperiment('');
        this.props.updateVisible(true);
        this.props.updateIsStable(false);
        break;
      case 'Recommended':
        this.props.updatePilotExperiment('');
        this.props.updateVisible(true);
        this.props.updateIsStable(true);
        break;
      case 'Beta':
      default:
        this.props.updatePilotExperiment('');
        this.props.updateVisible(false);
        this.props.updateIsStable(false);
        break;
    }
  };

  render() {
    return (
      <div>
        <label>
          Family Name
          <select
            value={this.props.familyName}
            style={styles.dropdown}
            onChange={event => this.props.updateFamilyName(event.target.value)}
          >
            {!this.props.isCourse && <option value="">(None)</option>}
            {this.props.families.map(familyOption => (
              <option key={familyOption} value={familyOption}>
                {familyOption}
              </option>
            ))}
          </select>
          <HelpTip>
            <p>
              The family name is used to group together courses that are
              different version years of the same course so that users can be
              redirected between different version years.
            </p>
          </HelpTip>
        </label>
        <label>
          Version Year
          <select
            value={this.props.versionYear}
            style={styles.dropdown}
            onChange={event => this.props.updateVersionYear(event.target.value)}
          >
            <option value="">(None)</option>
            {this.props.versionYearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Published State
          <select
            className="publishedStateSelector"
            value={this.props.publishedState}
            style={styles.dropdown}
            onChange={this.handlePublishedStateChange}
          >
            {publishedStates.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <HelpTip>
            <table>
              <thead>
                <tr>
                  <th>Publish State</th>
                  <th>Overview</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.tableBorder}>Pilot</td>
                  <td style={styles.tableBorder}>
                    A limited set of teachers who are in a pilot experiment can
                    see and assign the course.
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableBorder}>Beta</td>
                  <td style={styles.tableBorder}>
                    Anyone who has the link can view the course and make
                    progress on it. It is not assignable by teachers yet.
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableBorder}>Preview</td>
                  <td style={styles.tableBorder}>
                    The course is now a choice in the dropdown that is
                    assignable but is not the recommended course.
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableBorder}>Recommended</td>
                  <td style={styles.tableBorder}>
                    The course is the recommended course. It is assignable and
                    we try to get teachers to use this course.
                  </td>
                </tr>
              </tbody>
            </table>
          </HelpTip>
        </label>
        {this.props.publishedState === 'Pilot' && (
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
              value={this.props.pilotExperiment}
              style={styles.input}
              onChange={event =>
                this.props.updatePilotExperiment(event.target.value)
              }
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
  },
  tableBorder: {
    border: '1px solid ' + color.white,
    padding: 5
  }
};
