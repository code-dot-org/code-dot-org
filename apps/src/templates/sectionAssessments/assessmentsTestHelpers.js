import i18n from '@cdo/locale';

export const studentOverviewData = [
  {
    id: 1,
    name: 'Caley',
    numMultipleChoiceCorrect: 7,
    numMultipleChoice: 10,
    percentCorrect: '70%',
    submissionStatus: 'Completed',
    submissionTimeStamp: '2/16/18 - 7:41 AM',
    isSubmitted: true,
  },
  {
    id: 2,
    name: 'Maddie',
    numMultipleChoiceCorrect: 3,
    numMultipleChoice: 10,
    percentCorrect: '',
    submissionStatus: 'In Progress',
    submissionTimeStamp: '',
    isSubmitted: false,
  },
  {
    id: 3,
    name: 'Erin',
    numMultipleChoiceCorrect: 8,
    numMultipleChoice: 10,
    percentCorrect: '80%',
    submissionStatus: 'Completed',
    submissionTimeStamp: '5/29/18 - 7:41 AM',
    isSubmitted: true,
  },
  {
    id: 4,
    name: 'Dave',
    numMultipleChoiceCorrect: 10,
    numMultipleChoice: 10,
    percentCorrect: '100%',
    submissionStatus: 'Completed',
    submissionTimeStamp: '5/29/18 - 8:00 AM',
    isSubmitted: true,
  },
  {
    id: 5,
    name: 'Brad',
    numMultipleChoiceCorrect: 0,
    numMultipleChoice: 10,
    percentCorrect: '',
    submissionStatus: 'Not Started',
    submissionTimeStamp: '',
    isSubmitted: false,
  },
  {
    id: 6,
    name: 'Mike',
    numMultipleChoiceCorrect: 0,
    numMultipleChoice: 10,
    percentCorrect: '0%',
    submissionStatus: 'Completed',
    submissionTimeStamp: '5/29/18 - 8:05 AM',
    isSubmitted: true,
  },
];

export const studentData = [
  {
    id: '012896',
    name: 'Caley',
    studentAnswers: [
      {question: 1, answers: ['']},
      {question: 2, answers: ['B', 'D']},
      {question: 3, answers: ['E']},
      {question: 4, answers: ['C']},
      {question: 5, answers: ['A']},
      {question: 6, answers: ['']},
    ],
  },
];

export const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 40, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 20, isCorrectAnswer: false},
    ],
    notAnswered: 10,
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 30, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 10, isCorrectAnswer: false},
    ],
    notAnswered: 30,
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet plus a space?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 50, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 5, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5, isCorrectAnswer: true},
    ],
    notAnswered: 5,
  },
  {
    id: 4,
    question: '4. What is the best explanation for why digital data is represented in computers in binary?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 32, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionG(), percentAnswered: 5, isCorrectAnswer: false},
    ],
    notAnswered: 33,
  },
  {
    id: 5,
    question: '5. What is a function?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5, isCorrectAnswer: true},
    ],
    notAnswered: 25,
  },
];
