import React from 'react';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';
import commonMsg from '@cdo/locale';

//this is how to represent the student answers to make it easy to parse
const studentAnswers = {
	'012896': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'}, {question: 3, answer: ''}],
	'012897': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'}, {question: 3, answer: ''}],
	'012898': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'}, {question: 3, answer: ''}],
	'012899': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'}, {question: 3, answer: ''}],
};


//answerOptionA = 'A'

// const questions = {	
// 	question1: {
// 			answerOptions: [ {option: commonMsg.answerOptionA(), isCorrectAnswer: true}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}],
// 			//answer: {'A': {isCorrectAnswer: true}}
// 			questionText: '1. what is a variable?'
// 		},
// 	question2:
// 		{
// 			answerOptions: [{option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB(), isCorrectAnswer: true}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}, {option: commonMsg.answerOptionE()}, {option: commonMsg.answerOptionF()}],
// 			questionText: '2. What is a 4-bit number for the decimal number Ten(10)?'
// 		},
// 	question3:
// 		{
// 			answerOptions: [ {option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD(), isCorrectAnswer: true}, {option: commonMsg.answerOptionE()}],
// 			questionText: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?'
// 		},
// 	question4:
// 		{
// 			answerOptions: [ {option: commonMsg.answerOptionA(), isCorrectAnswer: true}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC(), isCorrectAnswer: true}, {option: commonMsg.answerOptionD()}, {option: commonMsg.answerOptionE()}, {option: commonMsg.answerOptionF()}, {option: commonMsg.answerOptionG()}],
// 			questionText: '4. What is a function?'
// 		},
//   };

const questions = [	
	{
		id: 1,
		question1: {
			answerOptions: [ {option: commonMsg.answerOptionA(), isCorrectAnswer: true}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}],
			//answer: {'A': {isCorrectAnswer: true}}
			questionText: '1. what is a variable?'
		}
	},
	{
		id: 2,
		question2:
		{
			answerOptions: [{option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB(), isCorrectAnswer: true}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}, {option: commonMsg.answerOptionE()}, {option: commonMsg.answerOptionF()}],
			questionText: '2. What is a 4-bit number for the decimal number Ten(10)?'
		}
	},
	{
		id: 3,
		question3:
		{
			answerOptions: [ {option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD(), isCorrectAnswer: true}, {option: commonMsg.answerOptionE()}],
			questionText: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?'
		}
	},
	{
		id: 4,
		question4:
		{
			answerOptions: [ {option: commonMsg.answerOptionA(), isCorrectAnswer: true}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC(), isCorrectAnswer: true}, {option: commonMsg.answerOptionD()}, {option: commonMsg.answerOptionE()}, {option: commonMsg.answerOptionF()}, {option: commonMsg.answerOptionG()}],
			questionText: '4. What is a function?'
		}
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
							studentsAnswers={studentAnswers}
							questions={questions}
						/>
				)
			},
		]);
};


// const multipleChoiceData = [
//   {
//     id: 1,
//     question: '1. What is a variable?',
//     answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 40, isCorrectAnswer: true},
//                {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 20, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 20, isCorrectAnswer: false},
//     ],
//   },
//   {
//     id: 2,
//     question: '2. What is a 4-bit number for the decimal number Ten(10)?',
//     answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 30, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 10, isCorrectAnswer: true},
//                {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 10, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 20, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionF(), percentAnswered: 10, isCorrectAnswer: false},
//     ],
//   },
//   {
//     id: 3,
//     question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?',
//     answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 50, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 15, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 20, isCorrectAnswer: true},
//                {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 5, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
//     ],
//   },
//   {
//     id: 4,
//     question: '4. What is a function?',
//     answers:  [{multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
//                {multipleChoiceOption: commonMsg.answerOptionF(), percentAnswered: 32, isCorrectAnswer: true},
//                {multipleChoiceOption: commonMsg.answerOptionG(), percentAnswered: 5, isCorrectAnswer: false},
//     ],
//   },
// ];

// export default storybook => {
//   return storybook
//     .storiesOf('SectionAssessments/MultipleChoiceOverviewTable', module)
//     .addStoryTable([
//       {
//         name: 'Table for assessments',
//         description: 'Ability to see assessment overview for the entire class',
//         story: () => (
//             <MultipleChoiceOverviewTable
//               questionAnswerData={multipleChoiceData}
//             />
//         )
//       },
//     ]);
// };
