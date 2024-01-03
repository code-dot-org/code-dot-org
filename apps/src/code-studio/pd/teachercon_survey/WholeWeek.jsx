import React from 'react';
import {FormGroup, Row, Col} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import FormComponent from '../form_components/FormComponent';
import QuestionsTable from '../form_components/QuestionsTable';

const LABELS = {
  receivedClearCommunication:
    'I received clear communication about when and where TeacherCon would take place.',
  venueFeedback:
    'Do you have feedback about the venue and the way logistics were run for TeacherCon? Please be specific and provide suggestions for improvement.',
  knowWhereToGoForHelp:
    'I know where to go if I need help preparing to teach this material.',
  suitableForMyExperience:
    'This professional development was suitable for my level of experience with teaching {course}.',
  practicingTeachingHelped:
    'Practicing teaching a lesson helped me better understand the methods I will use to teach {course} with my own students.',
  seeingOthersTeachHelped:
    'Seeing others teach lessons helped me better understand the methods I will use to teach {course} with my own students.',
  facilitatorsPresentedInformationClearly:
    'My facilitators clearly presented the information that I needed to learn.',
  facilitatorsProvidedFeedback:
    'My facilitators provided feedback that helped me learn during TeacherCon.',
  feltComfortableAskingQuestions:
    'When I had questions, I felt comfortable asking my facilitators for clarification or additional information.',
  morePreparedThanBefore:
    'I feel more prepared to teach {course} than I did before TeacherCon.',
  lookForwardToContinuing:
    'I feel like part of a community of {course} teachers.',
  partOfCommunity:
    'I look forward to continuing the {course} teacher development program throughout the year.',
  allStudentsShouldTake: 'I believe all students should take {course}.',
  wouldRecommend: 'I would recommend this PD to others.',
  bestPdEver:
    'This was the absolute best professional development I’ve ever participated in.',
  howMuchParticipated: 'During TeacherCon, how much did you participate?',
  howOftenLostTrackOfTime:
    'How often did you get so focused on {course} workshop activities that you lost track of time?',
  howExcitedBefore:
    'Before TeacherCon, how excited were you about attending the {course} workshop?',
  howHappyAfter:
    'After TeacherCon, how happy are you that you attended the {course} workshop?',
  facilitatorsDidWell:
    'Overall, what were the two things that TeacherCon facilitators did well this week?',
  facilitatorsCouldImprove:
    'Overall, what were the two things that TeacherCon facilitators could work on doing differently?',
  likedMost:
    'What were the two things you liked most about TeacherCon and why?',
  wouldChange:
    'What are the two things you would change about TeacherCon and why? How would you improve those things for future participants?',
  otherFeedbackWholeWeek:
    'Is there anything else you’d like to tell us about your experience this week?',
  givePermissionToQuote:
    'I give Code.org permission to quote my written feedback from today for use on social media, promotional materials, and other communications. (We love sharing what our teachers think about us!)',
};

export default class WholeWeek extends FormComponent {
  labelFor(name) {
    return LABELS[name].replace('{course}', this.props.course);
  }

  render() {
    return (
      <FormGroup>
        <h3>Conference Feedback (Thinking About the Week as a Whole)</h3>
        {this.buildButtonsFromOptions({
          label: this.labelFor('receivedClearCommunication'),
          name: 'receivedClearCommunication',
          required: true,
          type: 'radio',
        })}
        {this.buildFieldGroup({
          componentClass: 'textarea',
          label: this.labelFor('venueFeedback'),
          name: 'venueFeedback',
          required: true,
        })}

        <h4>Please rate your level of agreement with each statement below.</h4>
        <QuestionsTable
          data={this.props.data}
          errors={this.props.errors}
          labelSpan={5}
          onChange={this.props.onChange}
          options={this.props.options.knowWhereToGoForHelp}
          questions={[
            'knowWhereToGoForHelp',
            'suitableForMyExperience',
            'practicingTeachingHelped',
            'seeingOthersTeachHelped',
            'facilitatorsPresentedInformationClearly',
            'facilitatorsProvidedFeedback',
            'feltComfortableAskingQuestions',
            'morePreparedThanBefore',
            'lookForwardToContinuing',
            'partOfCommunity',
            'allStudentsShouldTake',
            'wouldRecommend',
            'bestPdEver',
          ].map(key => ({
            label: this.labelFor(key),
            name: key,
            required: true,
          }))}
        />

        {[
          'howMuchParticipated',
          'howOftenLostTrackOfTime',
          'howExcitedBefore',
          'howHappyAfter',
        ].map(key =>
          this.buildButtonsFromOptions({
            label: this.labelFor(key),
            name: key,
            required: true,
            type: 'radio',
          })
        )}

        {[
          'facilitatorsDidWell',
          'facilitatorsCouldImprove',
          'likedMost',
          'wouldChange',
        ].map(key =>
          this.buildFieldGroup({
            componentClass: 'textarea',
            label: this.labelFor(key),
            name: key,
            required: true,
          })
        )}

        {this.buildFieldGroup({
          componentClass: 'textarea',
          label: this.labelFor('otherFeedbackWholeWeek'),
          name: 'otherFeedbackWholeWeek',
          required: false,
        })}

        {this.buildButtonsFromOptions({
          label: this.labelFor('givePermissionToQuote'),
          name: 'givePermissionToQuote',
          required: true,
          type: 'radio',
        })}

        <p>
          Before TeacherCon we asked you how closely your own beliefs are to
          statements in a given pair. Consider these pairs of statements and
          rate how closely your own beliefs align to those in the statements.
        </p>

        <hr />

        <Row>
          <Col md={6}>
            <h4>Statement A</h4>
            <p>
              Instruction and class activities should focus on maintaining high
              standards and rigor so that students reach the highest level of
              achievement, even if some students struggle with the material.
            </p>
          </Col>
          <Col md={6}>
            <h4>Statement B</h4>
            <p>
              Instruction and class activities should focus on ensuring that
              students with the least prior knowledge and preparation are not
              left behind, even if that means that less material can be covered.
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={4} mdOffset={4}>
            {this.buildButtonsFromOptions({
              label: '',
              name: 'instructionFocus',
              required: false,
              type: 'radio',
            })}
          </Col>
        </Row>

        <hr />

        <Row>
          <Col md={6}>
            <h4>Statement A</h4>
            <p>
              Computer science teachers have a responsibility to recruit a set
              of students into their classrooms that are representative of the
              school’s population in terms of diversity (gender, racial,
              socio-economic, etc)...
            </p>
          </Col>
          <Col md={6}>
            <h4>Statement B</h4>
            <p>
              Computer science teachers’ responsibility is to promote their
              computer science classes broadly, to all students. The diversity
              of the class will reflect those most interested in taking a
              computer science class.
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={4} mdOffset={4}>
            {this.buildButtonsFromOptions({
              label: '',
              name: 'teacherResponsibility',
              required: false,
              type: 'radio',
            })}
          </Col>
        </Row>

        <hr />

        <Row>
          <Col md={6}>
            <h4>Statement A</h4>
            <p>
              The teacher should ensure that their time, and students’ access to
              resources are distributed equally for all.
            </p>
          </Col>
          <Col md={6}>
            <h4>Statement B</h4>
            <p>
              It’s important that the teacher prioritize their time and
              resources for students who have the most need.
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={4} mdOffset={4}>
            {this.buildButtonsFromOptions({
              label: '',
              name: 'teacherTime',
              required: false,
              type: 'radio',
            })}
          </Col>
        </Row>
      </FormGroup>
    );
  }
}

WholeWeek.associatedFields = Object.keys(LABELS).concat([
  'instructionFocus',
  'teacherResponsibility',
  'teacherTime',
]);
