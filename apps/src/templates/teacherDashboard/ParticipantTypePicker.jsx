import {Typography} from '@mui/material';
/**
 * View shown to an instructor if they can create sections with different participant types
 * (students, teachers, facilitators). Allows user to pick participant type for this section
 */
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import CardContainer from './CardContainer';
import LoginTypeCard from './LoginTypeCard';

import styles from './sectionSetup.module.scss';

const cardInfoByAudience = {
  student: {
    title: i18n.participantTypeStudentTitle(),
    description: i18n.participantTypeStudentDescription(),
  },
  teacher: {
    title: i18n.participantTypeTeacherTitle(),
    description: i18n.participantTypeTeacherDescription(),
  },
  facilitator: {
    title: i18n.participantTypeFacilitatorTitle(),
    description: i18n.participantTypeFacilitatorDescription(),
  },
};

/**
 * UI for selecting the participant type of a class section:
 * Student, Teacher or Facilitator
 */
export default class ParticipantTypePicker extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    setParticipantType: PropTypes.func.isRequired,
    availableParticipantTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  render() {
    const {title, setParticipantType} = this.props;

    return (
      <div className={`${styles.screen} uitest-participant-type-picker`}>
        <Typography className={styles.screenTitle} variant="h3">
          {title}
        </Typography>
        <Typography
          id="dsco-dialog-description"
          className={styles.bodyText}
          variant="body1"
        >
          {i18n.professionalLearningParticipantQuestion()}
        </Typography>
        <CardContainer>
          {this.props.availableParticipantTypes.map(type => (
            <ParticipantTypeCard
              onClick={setParticipantType}
              key={type}
              type={type}
            />
          ))}
        </CardContainer>
      </div>
    );
  }
}

const ParticipantTypeCard = props => (
  <LoginTypeCard
    className={`uitest-${props.type}-type`}
    title={cardInfoByAudience[props.type].title}
    subtitle={cardInfoByAudience[props.type].description}
    onClick={() => props.onClick(props.type)}
  />
);
ParticipantTypeCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  type: PropTypes.string,
};
