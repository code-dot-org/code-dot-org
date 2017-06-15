import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import SectionTable from './SectionTable';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import { setSections } from './teacherSectionsRedux';

const styles = {
  breadcrumb: {
    marginTop: 20,
    marginBottom: 28
  },
  button: {
    marginBottom: 20
  }
};

class SectionsPage extends Component {
  static propTypes = {
    numSections: PropTypes.number.isRequired,
    setSections: PropTypes.func.isRequired,
  };

  state = {
    sectionsLoaded: false
  };

  componentDidMount() {
    $.getJSON("/v2/sections/").done(sections => {
      this.props.setSections(sections);
      this.setState({
        sectionsLoaded: true
      });
    });
  }

  render() {
    const { numSections } = this.props;
    const { sectionsLoaded } = this.state;
    // TODO: i18n
    return (
      <div>
        <div style={styles.breadcrumb}>
          <a href="/teacher-dashboard#/">
            Teacher home page
          </a>
          <span style={{opacity: 0.5}}>{"\u00a0 \u25b6 \u00a0"}</span>
          <b style={{color: color.dark_orange}}>
            Student Accounts and Progress
          </b>
        </div>
        <ProgressButton
          text={"New section"}
          style={styles.button}
          onClick={() => console.log('create new section')}
          color={ProgressButton.ButtonColor.gray}
        />
        {sectionsLoaded && numSections === 0 &&
          <div className="jumbotron">
            <p>
              Create new sections and add students to them. Sections help you
              organize students into smaller groups so you can track their progress
              and manage their accounts.
            </p>
          </div>
        }
        {sectionsLoaded && numSections > 0 && <SectionTable/>}
      </div>
    );
  }
}

export default connect(state => ({
  numSections: state.teacherSections.sectionIds.length
}), { setSections })(SectionsPage);
