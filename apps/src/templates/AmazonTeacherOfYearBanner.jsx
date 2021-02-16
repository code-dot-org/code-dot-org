import React from 'react';
import PropTypes from 'prop-types';
import TeacherInfoBanner from './TeacherInfoBanner';

function AmazonTeacherOfYearBanner({handleCloseBanner}) {
  return (
    <TeacherInfoBanner
      header="Amazon Teacher of the Year Award!"
      primaryButton={{
        href: 'http://bit.ly/dash-AFETeacher2021',
        text: 'Learn more'
      }}
      secondaryButton={{
        text: 'No thanks',
        onClick: handleCloseBanner
      }}
    >
      <p>
        Every year, Amazon Future Engineer recognizes ten all-star teachers for
        their excellence in instruction and dedication to broadening access to
        computer science education.
      </p>
      <p>
        Award recipients will be formally recognized by Amazon and receive
        $25,000 to further computer science and/or robotics education at their
        school plus an additional $5,000 teacher cash award. Applications close
        March 19, 2021. Middle and high school Code.org teachers registered with
        Amazon Future Engineer are eligible.
      </p>
    </TeacherInfoBanner>
  );
}

AmazonTeacherOfYearBanner.propTypes = {
  handleCloseBanner: PropTypes.func.isRequired
};

export default AmazonTeacherOfYearBanner;
