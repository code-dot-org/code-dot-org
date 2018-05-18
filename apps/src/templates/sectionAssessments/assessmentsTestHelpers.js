import commonMsg from '@cdo/locale';

export const studentData = [
  {
    id: '012896',
    name: 'Caley',
    studentAnswers: [
      {question: 1, answer: ['']},
      {question: 2, answer: ['B', 'D']},
      {question: 3, answer: ['E']},
      {question: 4, answer: ['C']},
      {question: 5, answer: ['A']},
      {question: 6, answer: ['']},
    ],
  },
];

export const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 40, isCorrectAnswer: true},
      {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 20, isCorrectAnswer: false},
    ],
    notAnswered: 10,
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 30, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionF(), percentAnswered: 10, isCorrectAnswer: false},
    ],
    notAnswered: 30,
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 50, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 5, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 5, isCorrectAnswer: true},
    ],
    notAnswered: 5,
  },
  {
    id: 4,
    question: '4. What is a function?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionF(), percentAnswered: 32, isCorrectAnswer: true},
      {multipleChoiceOption: commonMsg.answerOptionG(), percentAnswered: 5, isCorrectAnswer: false},
    ],
    notAnswered: 33,
  },
  {
    id: 5,
    question: '5. What is binary search?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
      {multipleChoiceOption: commonMsg.answerOptionE(), percentAnswered: 5, isCorrectAnswer: true},
    ],
    notAnswered: 25,
  },
];

