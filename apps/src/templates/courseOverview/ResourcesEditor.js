import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import color from '@cdo/apps/util/color';
import CourseOverviewTopRow from './CourseOverviewTopRow';
import ResourceType, { stringForType, resourceShape } from './resourceType';

const styles = {
  box: {
    border: '1px solid ' + color.light_gray,
    padding: 10
  }
};

const defaultLinks = {
  '': '',
  [ResourceType.teacherForum]: 'https://forum.code.org/',
  [ResourceType.curriculum]: '/link/to/curriculum',
  [ResourceType.professionalLearning]: '/link/to/professional/learning',
};

export default class ResourcesEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
  };

  constructor(props) {
    super(props);

    const resources = [...props.resources];
    // add empty entries to get to three
    while (resources.length < 3) {
      resources.push({type: '', link: ''});
    }

    this.state = { resources };
  }

  handleChangeType = (event, index) => {
    const oldResources = this.state.resources;
    const newResources = _.cloneDeep(oldResources);
    const type = event.target.value;
    newResources[index].type = type;

    if (oldResources[index].link === defaultLinks[oldResources[index].type]) {
      newResources[index].link = defaultLinks[type];
    }

    this.setState({resources: newResources});
  }

  handleChangeLink = (event, index) => {
    const newResources = _.cloneDeep(this.state.resources);
    const link = event.target.value;
    newResources[index].link = link;
    this.setState({resources: newResources});
  }

  render() {
    const { resources } = this.state;

    return (
      <div>
        {resources.map((resource, index) =>
          <Resource
            key={index}
            id={index + 1}
            resource={resource}
            inputStyle={this.props.inputStyle}
            handleChangeType={event => this.handleChangeType(event, index)}
            handleChangeLink={event => this.handleChangeLink(event, index)}
          />
        )}

        <div style={styles.box}>
          <div style={{marginBottom: 5}}>Preview:</div>
          <CourseOverviewTopRow
            sectionsInfo={[]}
            id={-1}
            title="Unused title"
            resources={resources.filter(x => !!x.type)}
          />
        </div>
      </div>
    );
  }
}

const Resource = ({id, resource, inputStyle, handleChangeType, handleChangeLink}) => (
  <div>
    Resource {id}
    <div>Type</div>
    <select
      name="resourceTypes[]"
      style={inputStyle}
      value={resource.type}
      onChange={handleChangeType}
    >
      <option value={''} key={-1}>None</option>
      {Object.keys(ResourceType).map((type, index) =>
        <option value={type} key={index}>{stringForType[type]}</option>
      )}
    </select>
    <div>Link</div>
    <input
      type="text"
      style={inputStyle}
      name="resourceLinks[]"
      value={resource.link}
      onChange={handleChangeLink}
    />
  </div>
);
Resource.propTypes = {
  id: PropTypes.number.isRequired,
  resource: PropTypes.shape({
    type: PropTypes.oneOf([...Object.values(ResourceType), '']).isRequired,
    link: PropTypes.string.isRequired,
  }).isRequired,
  inputStyle: PropTypes.object.isRequired,
  handleChangeType: PropTypes.func.isRequired,
  handleChangeLink: PropTypes.func.isRequired,
};
