/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {Heading1, Heading2} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import LoginTypeCard from './LoginTypeCard';
import Button from '../Button';
import styleConstants from '../../styleConstants';

/**
 * UI for selecting the login type of a class section:
 * Word, picture, or email logins, or one of several third-party integrations.
 */
export default class AudienceTypePicker extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleImportOpen: PropTypes.func,
    setParticipantType: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    availableParticipantTypes: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  render() {
    const {title, setParticipantType, handleCancel, disabled} = this.props;

    return (
      <div style={style.container}>
        <Heading1>{title}</Heading1>
        <Heading2>{i18n.professionalLearningParticipantQuestion()}</Heading2>
        <div style={style.scroll}>
          <CardContainer>
            {this.props.availableParticipantTypes.map((type, index) => (
              <ParticipantTypeCard
                onClick={setParticipantType}
                key={index}
                title={type}
              />
            ))}
          </CardContainer>
        </div>
        <div style={style.footer}>
          <Button
            __useDeprecatedTag
            onClick={handleCancel}
            text={i18n.dialogCancel()}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
}

const ParticipantTypeCard = props => (
  <LoginTypeCard
    className={`uitest-${props.title}-type`}
    title={props.title}
    description={`Section for ${props.title}`}
    onClick={() => props.onClick(props.title)}
  />
);
ParticipantTypeCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  title: PropTypes.string
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
  thirdPartyProviderUpsell: {
    marginBottom: '10px'
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
  },
  emailPolicyNote: {
    marginBottom: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #000'
  }
};
