import $ from 'jquery';
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import Button from '@cdo/apps/templates/Button';

class PrintLoginCards extends React.Component {
  static propTypes = {
    // Provided by redux.
    section: PropTypes.object.isRequired,
    students: PropTypes.array.isRequired,
  };

  render() {
    const {section, students} = this.props;

    return (
      <div>
        {[SectionLoginType.word, SectionLoginType.picture].includes(section.loginType) &&
          <WordOrPictureLoginCards
            section={section}
            students={students}
          />
        }
      </div>
    );
  }
}

export const UnconnectedPrintLoginCards = PrintLoginCards;

export default connect(state => ({
  section: state.teacherSections.sections[state.teacherSections.selectedSectionId],
  students: state.sectionData.section.students,
}))(PrintLoginCards);

class WordOrPictureLoginCards extends React.Component {
  static propTypes = {
    section: PropTypes.object.isRequired,
    students: PropTypes.array.isRequired,
  };

  printLoginCards = () => {
    const printArea = $('#printArea').html();
    let printWindow = window.open('', 'printWindow', '');
    const {section} = this.props;

    printWindow.document.write(`<html><head><title>${i18n.printLoginCards_windowTitle({sectionName: section.name})}</title></head>`);
    printWindow.document.write('<body onafterprint="self.close()">');
    printWindow.document.write(printArea);
    printWindow.document.write('</body></html>');
  };

  render() {
    const {section, students} = this.props;

    return (
      <div>
        <h1>{i18n.printLoginCards_signingIn()}</h1>
        <p>{i18n.printLoginCards_steps()}</p>
        <ol>
          {/* TODO: make code.org/join link below dynamic */}
          <li>{i18n.printLoginCards_step1({joinUrl: "http://code.org/join"})}</li>
          <li>{i18n.printLoginCards_step2({code: section.code})}</li>
          <li>{i18n.printLoginCards_step3()}</li>
          <li>{i18n.printLoginCards_step4({wordOrPicture: section.loginType})}</li>
          <li>{i18n.printLoginCards_step5()}</li>
        </ol>
        <p>{i18n.printLoginCards_stepsReset({wordOrPicture: section.loginType})}</p>
        <br/>
        <h1>{i18n.printLoginCards_resetTitle()}</h1>
        <p>{i18n.printLoginCards_resetBody()}</p>
        <br/>
        <h1>{i18n.printLoginCards_loginCardsTitle()}</h1>
        <Button
          text={i18n.printLoginCards_loginCardsButton()}
          color="orange"
          onClick={this.printLoginCards}
        />
        <br/>
        <div id="printArea">
          {(students || []).map(student => (
            <LoginCard key={student.id} student={student}/>
          ))}
        </div>
      </div>
    );
  }
}

class LoginCard extends React.Component {
  static propTypes = {
    student: PropTypes.object.isRequired,
  };

  render() {
    const {student} = this.props;

    return (
      <div>
        {student.name}
      </div>
    );
  }
}
