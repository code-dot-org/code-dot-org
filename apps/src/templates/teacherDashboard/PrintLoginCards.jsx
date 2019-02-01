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

const styles = {
  container: {
    width: 840,
  },
  card: {
    border: '1px dashed black',
    width: 378,
    height: 324,
    padding: 10,
    margin: 8,
    float: 'left',
    fontFamily: '"Gotham 4r", sans-serif',
    color: 'dimgray',
  },
  text: {
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  img: {
    width: 150,
    marginTop: 10,
  }
};


class WordOrPictureLoginCards extends React.Component {
  static propTypes = {
    section: PropTypes.object.isRequired,
    students: PropTypes.array.isRequired,
  };

  printLoginCards = () => {
    const printArea = document.getElementById('printArea').outerHTML;
    // TODO: add uniqueId to window name
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
          {section.loginType === SectionLoginType.picture &&
            <li>{i18n.printLoginCards_step4_secretPicture()}</li>
          }
          {section.loginType === SectionLoginType.word &&
            <li>{i18n.printLoginCards_step4_secretWords()}</li>
          }
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
        <div id="printArea" style={styles.container}>
          {(students || []).map(student => (
            <LoginCard key={student.id} section={section} student={student}/>
          ))}
        </div>
      </div>
    );
  }
}

/**
 * LoginCard component for word and picture logins.
 */
class LoginCard extends React.Component {
  static propTypes = {
    section: PropTypes.object.isRequired,
    student: PropTypes.object.isRequired,
  };

  render() {
    const {section, student} = this.props;

    return (
      <div style={styles.card}>
        <p style={styles.text}>
          {/* TODO: fix link below */}
          {i18n.loginCard_instructions({url: "http://code.org/join", code: section.code})}
        </p>
        <p style={styles.text}>
          <span style={styles.bold}>{i18n.loginCard_directUrl()}</span>
          {/* TODO: fix link below */}
          {` studio.code.org/sections/${section.code}`}
        </p>
        <p style={styles.text}>
          <span style={styles.bold}>{i18n.loginCard_sectionName()}</span>
          {` ${section.name}`}
        </p>
        <p style={styles.text}>
          <span style={styles.bold}>{i18n.loginCard_name()}</span>
          {` ${student.name}`}
        </p>
        {section.loginType === SectionLoginType.picture &&
          <p style={styles.text}>
            <span style={styles.bold}>{i18n.loginCard_secretPicture()}</span>
            <br/>
            {/* TODO: fix link below */}
            <img src={'http://localhost.code.org:3000/images/' + student.secret_picture_path} style={styles.img}/>
          </p>
        }
        {section.loginType === SectionLoginType.word &&
          <p style={styles.text}>
            <span style={styles.bold}>{i18n.loginCard_secretWords()}</span>
            <span>{` ${student.secret_words}`}</span>
          </p>
        }
      </div>
    );
  }
}
