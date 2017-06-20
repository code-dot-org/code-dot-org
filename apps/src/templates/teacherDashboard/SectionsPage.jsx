import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import SectionTable from './SectionTable';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import { setSections, newSection } from './teacherSectionsRedux';
import i18n from '@cdo/locale';

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
    newSection: PropTypes.func.isRequired,
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
    const { newSection, numSections } = this.props;
    const { sectionsLoaded } = this.state;
    return (
      <div>
        <div style={styles.breadcrumb}>
          <a href="/teacher-dashboard#/">
            {i18n.teacherHomePage()}
          </a>
          <span style={{opacity: 0.5}}>{"\u00a0 \u25b6 \u00a0"}</span>
          <b style={{color: color.dark_orange}}>
            {i18n.studentAccountsAndProgress()}
          </b>
        </div>
        <ProgressButton
          text={i18n.newSection()}
          style={styles.button}
          onClick={newSection}
          color={ProgressButton.ButtonColor.gray}
        />
        {sectionsLoaded && numSections === 0 &&
          <div className="jumbotron">
            <p>{i18n.createSectionsInfo()}</p>
          </div>
        }
        {sectionsLoaded && numSections > 0 && <SectionTable/>}
      </div>
    );
  }
}

export default connect(state => ({
  numSections: state.teacherSections.sectionIds.length
}), { newSection, setSections })(SectionsPage);
