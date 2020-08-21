import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';
import color from '@cdo/apps/util/color';
import ResourceType, {stringForType, resourceShape} from './resourceType';
import TeacherResourcesDropdown from '@cdo/apps/code-studio/components/progress/TeacherResourcesDropdown';

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

const defaultLinks = {
  '': '',
  [ResourceType.teacherForum]: 'https://forum.code.org/',
  [ResourceType.curriculum]: '/link/to/curriculum',
  [ResourceType.professionalLearning]: '/link/to/professional/learning',
  [ResourceType.lessonPlans]: '/link/to/lesson/plans',
  [ResourceType.vocabulary]: '/link/to/vocab',
  [ResourceType.codeIntroduced]: '/link/to/code/introduced',
  [ResourceType.standardMappings]: '/link/to/standard/mappings',
  [ResourceType.allHandouts]: '/link/to/all/handouts',
  [ResourceType.videos]: '/link/to/videos'
};

export default class ResourcesEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired
  };

  constructor(props) {
    super(props);

    const resources = [...props.resources];
    // add empty entries to get to max
    while (resources.length < Object.keys(ResourceType).length) {
      resources.push({type: '', link: ''});
    }

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

    if (oldResources[index].link === defaultLinks[oldResources[index].type]) {
      newResources[index].link = defaultLinks[type];
    }

    let errorString = '';
    let types = newResources.map(resource => resource.type).filter(Boolean);
    if (types.length !== _.uniq(types).length) {
      errorString = 'Your resource types contains a duplicate';
    }

    this.setState({resources: newResources, errorString});
  };

  handleChangeLink = (event, index) => {
    const newResources = _.cloneDeep(this.state.resources);
    const link = event.target.value;
    newResources[index].link = link;
    this.setState({resources: newResources});
  };

  render() {
    const {resources, errorString} = this.state;

    // avoid showing multiple empty resources
    const lastNonEmpty = _.findLastIndex(
      resources,
      ({type, link}) => link && type
    );

    // Resources contains maxResources entries. For the empty entries, we want to
    // show just one, so we slice to the lastNonEmpty +1 to get an empty entry
    // and +1 more because slice is exclusive.
    return (
      <div>
        {resources.slice(0, lastNonEmpty + 2).map((resource, index) => (
          <Resource
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
          <TeacherResourcesDropdown
            resources={resources.filter(x => !!x.type)}
          />
        </div>
      </div>
    );
  }
}

const Resource = ({
  id,
  resource,
  inputStyle,
  handleChangeType,
  handleChangeLink
}) => (
  <div style={{marginTop: 8}}>
    Resource {id}
    <div>Type</div>
    <select
      name="resourceTypes[]"
      style={inputStyle}
      value={resource.type}
      onChange={handleChangeType}
    >
      <option value={''} key={-1}>
        None
      </option>
      {Object.keys(ResourceType).map((type, index) => (
        <option value={type} key={index}>
          {stringForType[type]}
        </option>
      ))}
    </select>
    <div>Link</div>
    <input
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
    link: PropTypes.string.isRequired
  }).isRequired,
  inputStyle: PropTypes.object.isRequired,
  handleChangeType: PropTypes.func.isRequired,
  handleChangeLink: PropTypes.func.isRequired
};
