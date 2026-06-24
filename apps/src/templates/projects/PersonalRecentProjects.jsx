import {Typography as MuiTypography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import ProjectCard from './ProjectCard.jsx';
import {personalProjectDataPropType} from './projectConstants';

class PersonalRecentProjects extends Component {
  static propTypes = {
    projectList: PropTypes.arrayOf(personalProjectDataPropType).isRequired,
    isRtl: PropTypes.bool.isRequired,
  };

  render() {
    const {isRtl} = this.props;
    const cardPaddingStyle = isRtl ? styles.cardPaddingRtl : styles.cardPadding;

    return (
      <div style={styles.grid}>
        <MuiTypography
          style={styles.description}
          variant="h5"
          component="h4"
          gutterBottom
        >
          {i18n.projectsContinueWorking()}
        </MuiTypography>
        <div>
          {this.props.projectList &&
            this.props.projectList.slice(0, 4).map((project, index) => {
              const cardStyle =
                index < 3 ? {...styles.card, ...cardPaddingStyle} : styles.card;

              return (
                <div key={index} style={cardStyle}>
                  <ProjectCard
                    projectData={project}
                    currentGallery={'personal'}
                  />
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}

const styles = {
  grid: {
    width: '100%',
  },
  card: {
    display: 'inline-block',
    paddingTop: 10,
    paddingBottom: 20,
    paddingRight: 0,
    paddingLeft: 0,
  },
  cardPadding: {
    paddingRight: 35,
  },
  cardPaddingRtl: {
    paddingLeft: 35,
  },
  description: {
    zIndex: 2,
    width: 940,
  },
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(PersonalRecentProjects);
