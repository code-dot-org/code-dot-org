import React, { Component } from 'react';
import i18n from "@cdo/locale";
import color from "../util/color";

const styles = {
  heading: {
    color: color.teal,
    width: '100%'
  }
};

export default class TeachersBeyondHoc extends Component {

  render() {
    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsTeacherHeading()}
        </h1>
      </div>
    );
  }
}
