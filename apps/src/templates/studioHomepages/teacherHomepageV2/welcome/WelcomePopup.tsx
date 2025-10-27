import Modal from '@code-dot-org/component-library/modal';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {setHasSeenHomepageWelcome} from '@cdo/apps/templates/currentUserRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import slide1Image from './images/welcome-slide-0.png';
import slide2Image from './images/welcome-slide-1.png';
import slide3Image from './images/welcome-slide-2.png';
import slide4Image from './images/welcome-slide-3.png';
import slide5Image from './images/welcome-slide-4.png';

import styles from './welcome-popup.module.scss';

export interface WelcomePopupProps {
  onCloseCallback?: () => void;
}

const SLIDE_0 = {
  title: i18n.teacherHomepageWelcomeTitle0(),
  body: i18n.teacherHomepageWelcomeBody0(),
  image: slide1Image,
};

const SLIDE_1 = {
  title: i18n.teacherHomepageWelcomeTitle1(),
  body: i18n.teacherHomepageWelcomeBody1(),
  image: slide2Image,
};
const SLIDE_2 = {
  title: i18n.teacherHomepageWelcomeTitle2(),
  body: i18n.teacherHomepageWelcomeBody2(),
  image: slide3Image,
};

const SLIDE_3 = {
  title: i18n.teacherHomepageWelcomeTitle3(),
  body: i18n.teacherHomepageWelcomeBody3(),
  image: slide4Image,
};

const SLIDE_4 = {
  title: i18n.teacherHomepageWelcomeTitle4(),
  body: i18n.teacherHomepageWelcomeBody4(),
  image: slide5Image,
};

const SLIDES = [SLIDE_0, SLIDE_1, SLIDE_2, SLIDE_3, SLIDE_4];

const WelcomePopup: React.FC<WelcomePopupProps> = ({onCloseCallback}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const [stepNum, setStepNum] = React.useState(0);

  const dispatch = useAppDispatch();

  const handleClose = () => {
    setIsOpen(false);
    new UserPreferences().setHasSeenProgressTableInvite(true);
    dispatch(setHasSeenHomepageWelcome(true));
    if (onCloseCallback) {
      onCloseCallback();
    }
  };

  const handleNext = () => {
    if (stepNum >= SLIDES.length - 1) {
      handleClose();
    } else {
      setStepNum(prev => prev + 1);
    }
  };

  if (!isOpen) return null;

  const currentSlide = SLIDES[stepNum];

  return (
    <Modal
      title={currentSlide.title}
      onClose={() => handleClose()}
      primaryButtonProps={{
        text: stepNum === SLIDES.length - 1 ? i18n.done() : i18n.next(),
        onClick: handleNext,
      }}
      secondaryButtonProps={{
        text: i18n.back(),
        onClick: () => setStepNum(prev => Math.max(prev - 1, 0)),
        disabled: stepNum === 0,
      }}
      customContent={
        <div>
          <img src={currentSlide.image} alt="" className={styles.image} />
          <BodyTwoText>{currentSlide.body}</BodyTwoText>
        </div>
      }
    />
  );
};

export default WelcomePopup;
