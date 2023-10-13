import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '../../util/color';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import {selectGallery} from './projectsRedux';
import {connect} from 'react-redux';
import {Galleries} from './projectConstants';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import PersonalProjectsTable from '@cdo/apps/templates/projects/PersonalProjectsTable';
import LibraryTable from '@cdo/apps/templates/projects/LibraryTable';
import fontConstants from '@cdo/apps/fontConstants';

const galleryTabs = [
  {
    key: Galleries.PRIVATE,
    url: '/projects',
    headerText: i18n.myProjects(),
  },
  {
    key: Galleries.LIBRARIES,
    url: '/projects/libraries',
    headerText: i18n.myLibraries(),
  },
  {
    key: Galleries.PUBLIC,
    url: '/projects/public',
    headerText: i18n.publicProjects(),
  },
];

class ProjectsGallery extends Component {
  static propTypes = {
    limitedGallery: PropTypes.bool,
    canShare: PropTypes.bool.isRequired,

    // Provided by Redux
    selectedGallery: PropTypes.string.isRequired,
    selectGallery: PropTypes.func.isRequired,
  };

  toggleTo = tab => {
    window.history.pushState(null, null, tab.url);
    this.props.selectGallery(tab.key);
  };

  render() {
    return (
      <div>
        <div style={styles.container} id="uitest-gallery-switcher">
          {galleryTabs.map(tab => (
            <div
              key={tab.key}
              style={[
                styles.pill,
                this.props.selectedGallery === tab.key && styles.selectedPill,
              ]}
              onClick={() => this.toggleTo(tab)}
            >
              {tab.headerText}
            </div>
          ))}
        </div>
        {this.props.selectedGallery === Galleries.PRIVATE && (
          <PersonalProjectsTable canShare={this.props.canShare} />
        )}
        {this.props.selectedGallery === Galleries.LIBRARIES && <LibraryTable />}
        {this.props.selectedGallery === Galleries.PUBLIC && (
          <PublicGallery limitedGallery={this.props.limitedGallery} />
        )}
      </div>
    );
  }
}

const styles = {
  container: {
    marginBottom: 20,
    backgroundColor: color.neutral_light,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.lighter_gray,
    padding: 10,
    height: 36,
  },
  pill: {
    ':hover': {
      color: color.brand_primary_default,
    },
    border: 'none',
    borderRadius: 50,
    ...fontConstants['main-font-semi-bold'],
    fontSize: 20,
    backgroundColor: color.neutral_light,
    color: color.neutral_dark,
    margin: '0 0 0 20px',
    boxShadow: 'none',
    outline: 'none',
    padding: '8px 18px',
    float: 'left',
    cursor: 'pointer',
  },
  selectedPill: {
    ':hover': {
      color: color.neutral_white,
    },
    backgroundColor: color.brand_primary_default,
    color: color.neutral_white,
    border: 'none',
  },
};

export default connect(
  state => ({
    selectedGallery: state.projects.selectedGallery,
  }),
  dispatch => ({
    selectGallery(gallery) {
      dispatch(selectGallery(gallery));
    },
  })
)(Radium(ProjectsGallery));
