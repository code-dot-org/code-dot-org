import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import {resourceShape as migratedResourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import MigratedResourceEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';

//Editor for Teacher Resources
export default class ResourcesEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    resources: PropTypes.array,
    migratedResources: PropTypes.arrayOf(migratedResourceShape),
    studentFacing: PropTypes.bool,
    courseVersionId: PropTypes.number,
    getRollupsUrl: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      errorString: ''
    };
  }

  render() {
    const {errorString} = this.state;

    // If using migrated resources, we have to have a course version id
    if (!this.props.courseVersionId) {
      return (
        <strong>
          Cannot add resources to migrated unit without course version. A unit
          must belong to a course or have 'Is a Standalone Unit' checked to have
          a course version.
        </strong>
      );
    }

    return (
      <div>
        <MigratedResourceEditor
          courseVersionId={this.props.courseVersionId}
          resourceContext={
            this.props.studentFacing ? 'studentResource' : 'teacherResource'
          }
          resources={this.props.migratedResources}
          getRollupsUrl={this.props.getRollupsUrl}
        />
        <div style={styles.box}>
          <div style={styles.error}>{errorString}</div>
          <div style={{marginBottom: 5}}>Preview:</div>
          <ResourcesDropdown
            migratedResources={this.props.migratedResources}
            useMigratedResources
            studentFacing={this.props.studentFacing}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  box: {
    marginTop: 10,
    marginBottom: 10,
    border: '1px solid ' + color.light_gray,
    padding: 10
  },
  error: {
    color: 'red'
  }
};
