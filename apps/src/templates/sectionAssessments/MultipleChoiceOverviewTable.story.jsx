import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';
import commonMsg from '@cdo/locale';

const studentAnswers = {
	'012896': [{question: 1, answer: ''}, {question: 2, answer: 'D'}, {question: 3, answer: 'A'},{question: 2, answer: 'C'}],
	'012897': [{question: 1, answer: ''}, {question: 2, answer: 'B'}, {question: 3, answer: 'B'},{question: 2, answer: ''}],
	'012898': [{question: 1, answer: ''}, {question: 2, answer: ''}, {question: 3, answer: 'E'},{question: 2, answer: 'B'}],
    '012899': [{question: 1, answer: ''}, {question: 2, answer: ''}, {question: 3, answer: 'D'},{question: 2, answer: 'F'}],
    '012900': [{question: 1, answer: ''}, {question: 2, answer: ''}, {question: 3, answer: ''},{question: 2, answer: 'D'}],
    '012901': [{question: 1, answer: ''}, {question: 2, answer: ''}, {question: 3, answer: ''},{question: 2, answer: 'F'}]
};

const questions = [	
	{
		id: 1,
		answerOptions: 
		[
			{option: commonMsg.answerOptionA(), isCorrectAnswer: true}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}
		],
		questionText: '1. what is a variable?'
	},
	{
		id: 2,
		answerOptions: [
			{option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB(), isCorrectAnswer: true}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}, {option: commonMsg.answerOptionE()}, {option: commonMsg.answerOptionF()},
		],
		questionText: '2. What is a 4-bit number for the decimal number Ten(10)?'
	},
	{
		id: 3,
		answerOptions: [
			{option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD(), isCorrectAnswer: true}, {option: commonMsg.answerOptionE()},
		],
    	questionText: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?'	
	},
	{
		id: 4,
		answerOptions: [
			{option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC(), isCorrectAnswer: true}, {option: commonMsg.answerOptionD()}, {option: commonMsg.answerOptionE()}, {option: commonMsg.answerOptionF()}, {option: commonMsg.answerOptionG()},
		],
		questionText: '4. What is a function?'
	},
];

export default storybook => {
	return storybook
		.storiesOf('SectionAssessments/MultipleChoiceOverviewTable', module)
		.addStoryTable([
			{
				name: 'Table for assessments',
				description: 'Ability to see assessment overview for the entire class',
				story: () => (
					<MultipleChoiceOverviewTable
					  studentAnswers={studentAnswers}
					  questions={questions}
					/>
				)
			},
		]);
};




