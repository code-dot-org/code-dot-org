/**
 * View shown to an instructor if they can create sections with different participant types
 * (students, teachers, facilitators). Allows user to pick participant type for this section
 */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {Heading1, Heading2} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import LoginTypeCard from './LoginTypeCard';
import Button from '../Button';
import styleConstants from '../../styleConstants';

const cardInfoByAudience = {
  student: {
    title: i18n.participantTypeStudentTitle(),
    description: i18n.participantTypeStudentDescription()
  },
  teacher: {
    title: i18n.participantTypeTeacherTitle(),
    description: i18n.participantTypeTeacherDescription()
  },
  facilitator: {
    title: i18n.participantTypeFacilitatorTitle(),
    description: i18n.participantTypeFacilitatorDescription()
  }
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
    availableParticipantTypes: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  render() {
    const {title, setParticipantType, handleCancel} = this.props;

    return (
      <div style={style.container} className="uitest-participant-type-picker">
        <Heading1>{title}</Heading1>
        <Heading2>{i18n.professionalLearningParticipantQuestion()}</Heading2>
        <div style={style.scroll}>
          <CardContainer>
            {this.props.availableParticipantTypes.map((type, index) => (
              <ParticipantTypeCard
                onClick={setParticipantType}
                key={index}
                type={type}
              />
            ))}
          </CardContainer>
        </div>
        <div style={style.footer}>
          <Button
            onClick={handleCancel}
            text={i18n.dialogCancel()}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
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
    description={cardInfoByAudience[props.type].description}
    onClick={() => props.onClick(props.type)}
  />
);
ParticipantTypeCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  type: PropTypes.string
};

const style = {
  container: {
    width: styleConstants['content-width'],
    height: '360px',
    left: '20px',
    right: '20px'
  },
  scroll: {
    overflowX: 'hidden',
    overflowY: 'auto',
    height: 'calc(80vh - 200px)'
  },
  footer: {
    position: 'absolute',
    width: styleConstants['content-width'],
    height: '100px',
    left: 0,
    bottom: '-65px',
    padding: '0px 20px 20px 20px',
    backgroundColor: '#fff',
    borderRadius: '5px'
  }
};
