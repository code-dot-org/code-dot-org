/**
 * View shown to an instructor if they can create sections with different participant types
 * (students, teachers, facilitators). Allows user to pick participant type for this section
 */
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import {Heading3} from '../../legacySharedComponents/Headings';
import styleConstants from '../../styleConstants';
import color from '../../util/color';

import CardContainer from './CardContainer';
import LoginTypeCard from './LoginTypeCard';

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
    handleCancel: PropTypes.func.isRequired,
    availableParticipantTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  render() {
    const {title, setParticipantType, handleCancel} = this.props;

    return (
      <div style={style.container} className="uitest-participant-type-picker">
        <Heading3 isRebranded>{title}</Heading3>
        <p style={style.bodyText}>
          {i18n.professionalLearningParticipantQuestion()}
        </p>
        <div style={style.scroll}>
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
        <div style={style.footer}>
          <Button
            onClick={handleCancel}
            text={i18n.dialogCancel()}
            color={Button.ButtonColor.neutralDark}
            style={{margin: 0}}
          />
        </div>
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

const style = {
  container: {
    width: styleConstants['content-width'],
    color: color.neutral_dark,
    height: '300px',
    left: '20px',
    right: '20px',
  },
  bodyText: {
    fontSize: '1em',
  },
  scroll: {
    overflowX: 'hidden',
    overflowY: 'auto',
    height: 'calc(80vh - 200px)',
  },
  footer: {
    position: 'absolute',
    width: styleConstants['content-width'],
    height: '50px',
    left: 0,
    bottom: '-23px',
    padding: '0px 20px 20px 20px',
    backgroundColor: '#fff',
    borderRadius: '5px',
  },
};
