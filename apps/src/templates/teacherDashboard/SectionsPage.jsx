import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import SectionTable from './SectionTable';
import RosterDialog from './RosterDialog';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import { setSections, newSection } from './teacherSectionsRedux';
import { loadClassroomList } from './googleClassroomRedux';
import { classroomShape } from './shapes';
import i18n from '@cdo/locale';

const styles = {
  breadcrumb: {
    marginTop: 20,
    marginBottom: 28
  },
  button: {
    marginBottom: 20,
    marginRight: 5,
  }
};

class SectionsPage extends Component {
  static propTypes = {
    numSections: PropTypes.number.isRequired,
    classrooms: PropTypes.arrayOf(classroomShape),
    newSection: PropTypes.func.isRequired,
    setSections: PropTypes.func.isRequired,
    loadClassroomList: PropTypes.func.isRequired,
  };

  state = {
    sectionsLoaded: false,
    rosterDialogOpen: false,
  };

  componentDidMount() {
    $.getJSON("/v2/sections/").done(sections => {
      this.props.setSections(sections);
      this.setState({
        sectionsLoaded: true
      });
    });
  }

  handleImportOpen = () => {
    this.setState({rosterDialogOpen: true});
    this.props.loadClassroomList();
  };

  handleImportClose = (selectedId) => {
    this.setState({rosterDialogOpen: false});
    // TODO (josh): use `selectedId`.
    console.log(selectedId);
  };

  addSection = () => this.props.newSection();

  render() {
    const { numSections } = this.props;
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
        {sectionsLoaded &&
          <ProgressButton
            text={i18n.newSection()}
            style={styles.button}
            onClick={this.addSection}
            color={ProgressButton.ButtonColor.gray}
          />
        }
        {sectionsLoaded &&
          <ProgressButton
            text={i18n.importFromGoogleClassroom()}
            style={styles.button}
            onClick={this.handleImportOpen}
            color={ProgressButton.ButtonColor.gray}
          />
        }
        {sectionsLoaded && numSections === 0 &&
          <div className="jumbotron">
            <p>{i18n.createSectionsInfo()}</p>
          </div>
        }
        {sectionsLoaded && numSections > 0 && <SectionTable/>}
        <RosterDialog
          isOpen={this.state.rosterDialogOpen}
          handleClose={this.handleImportClose}
          classrooms={this.props.classrooms}
        />
      </div>
    );
  }
}

export default connect(state => ({
  numSections: state.teacherSections.sectionIds.length,
  classrooms: state.googleClassroom.classrooms,
}), { newSection, setSections, loadClassroomList })(SectionsPage);
