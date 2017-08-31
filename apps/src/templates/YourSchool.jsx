import React from 'react';
import YourSchoolResources from './YourSchoolResources';
import i18n from "@cdo/locale";

export default class YourSchool extends React.Component {
  render() {
    return (
      <div>
        <h1>
          {i18n.yourSchoolHeading()}
        </h1>
        <h3>
          {i18n.yourSchoolDescription()}
        </h3>
        <YourSchoolResources/>
        <h2>
          {i18n.yourSchoolTellUs()}
        </h2>
        Hey, look! This is where the census form will be.
      </div>
    );
  }
}
