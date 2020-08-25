import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import color from '@cdo/apps/util/color';
import {resourceShape} from './resourceType';
import TeacherResourcesDropdown from '@cdo/apps/code-studio/components/progress/TeacherResourcesDropdown';
import ResourceEditorInput from '@cdo/apps/templates/courseOverview/ResourceEditorInput';

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

export default class ResourcesEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired
  };

  constructor(props) {
    super(props);

    const resources = [...props.resources];
    resources.push({type: '', link: '/link/to/resource'});

    this.state = {
      resources,
      errorString: ''
    };
  }

  handleChangeType = (event, index) => {
    const oldResources = this.state.resources;
    const newResources = _.cloneDeep(oldResources);
    const type = event.target.value;
    newResources[index].type = type;

    let errorString = '';
    let types = newResources.map(resource => resource.type).filter(Boolean);
    if (types.length !== _.uniq(types).length) {
      errorString = 'Your resource types contains a duplicate';
    }

    this.setState({resources: newResources, errorString}, this.addNewResource);
  };

  addNewResource = () => {
    if (this.state.resources[this.state.resources.length - 1].type) {
      const oldResources = this.state.resources;
      const newResources = _.cloneDeep(oldResources);
      newResources.push({type: '', link: '/link/to/resource'});
      this.setState({resources: newResources});
    }
  };

  handleChangeLink = (event, index) => {
    const newResources = _.cloneDeep(this.state.resources);
    const link = event.target.value;
    newResources[index].link = link;
    this.setState({resources: newResources});
  };

  render() {
    const {resources, errorString} = this.state;

    return (
      <div>
        {resources.map((resource, index) => (
          <ResourceEditorInput
            key={index}
            id={index + 1}
            resource={resource}
            inputStyle={this.props.inputStyle}
            handleChangeType={event => this.handleChangeType(event, index)}
            handleChangeLink={event => this.handleChangeLink(event, index)}
          />
        ))}

        <div style={styles.box}>
          <div style={styles.error}>{errorString}</div>
          <div style={{marginBottom: 5}}>Preview:</div>
          <TeacherResourcesDropdown resources={resources} />
        </div>
      </div>
    );
  }
}
