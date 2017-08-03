/** @file Root component for the (deprecated) teacher
 *        dashboard sections page. */
import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import OwnedSections from './OwnedSections';

export default class SectionsPage extends Component {
  static propTypes = {
    defaultCourseId: PropTypes.number,
    defaultScriptId: PropTypes.number,
  };

  render() {
    return (
      <div>
        <Breadcrumb/>
        <OwnedSections
          defaultCourseId={this.props.defaultCourseId}
          defaultScriptId={this.props.defaultScriptId}
        />
      </div>
    );
  }
}

export const Breadcrumb = () => (
  <div
    style={{
      marginTop: 20,
      marginBottom: 28
    }}
  >
    <a href="/teacher-dashboard#/">
      {i18n.teacherHomePage()}
    </a>
    <span style={{opacity: 0.5}}>
      {"\u00a0 \u25b6 \u00a0"}
    </span>
    <b style={{color: color.dark_orange}}>
      {i18n.studentAccountsAndProgress()}
    </b>
  </div>
);
