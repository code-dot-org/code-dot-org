import i18n from '@cdo/locale';
import {
  inProgressFakeTimestamp,
  notStartedFakeTimestamp
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';

export const testDataTimestamps = {
  newest: new Date('2019-04-09T20:52:05.000+00:00'),
  newer: new Date('2019-04-09T20:40:05.000+00:00'),
  new: new Date('2019-02-09T20:52:05.000+00:00'),
  old: new Date('2018-12-09T20:52:05.000+00:00'),
  older: new Date('2018-10-09T20:52:05.000+00:00'),
  oldest: new Date('2018-10-07T20:52:05.000+00:00'),
  notStarted: notStartedFakeTimestamp,
  inProgress: inProgressFakeTimestamp
};

// Data for students' assessments multiple choice table
export const studentOverviewData = [
  {
    id: 1,
    name: 'Caley',
    numMultipleChoiceCorrect: 7,
    numMultipleChoice: 10,
    numMatchCorrect: 7,
    numMatch: 10,
    isSubmitted: false,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.notStarted
  },
  {
    id: 2,
    name: 'Maddie',
    numMultipleChoiceCorrect: 3,
    numMultipleChoice: 10,
    numMatchCorrect: 3,
    numMatch: 10,
    isSubmitted: false,
    inProgress: true,
    submissionTimeStamp: testDataTimestamps.inProgress
  },
  {
    id: 3,
    name: 'Erin',
    numMultipleChoiceCorrect: 8,
    numMultipleChoice: 10,
    numMatchCorrect: 8,
    numMatch: 10,
    isSubmitted: true,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.newest
  },
  {
    id: 4,
    name: 'Dave',
    numMultipleChoiceCorrect: 10,
    numMultipleChoice: 10,
    isSubmitted: true,
    numMatchCorrect: 10,
    numMatch: 10,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.newer
  },
  {
    id: 5,
    name: 'Brad',
    numMultipleChoiceCorrect: 0,
    numMultipleChoice: 10,
    numMatchCorrect: 0,
    numMatch: 10,
    isSubmitted: true,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.new
  },
  {
    id: 6,
    name: 'Mike',
    numMultipleChoiceCorrect: 0,
    numMultipleChoice: 10,
    numMatchCorrect: 0,
    numMatch: 10,
    isSubmitted: true,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.old
  },
  {
    id: 7,
    name: 'Dani',
    numMultipleChoiceCorrect: 0,
    numMultipleChoice: 10,
    numMatchCorrect: 0,
    numMatch: 10,
    isSubmitted: true,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.older
  },
  {
    id: 8,
    name: 'Amanda',
    numMultipleChoiceCorrect: 0,
    numMultipleChoice: 10,
    numMatchCorrect: 0,
    numMatch: 10,
    isSubmitted: true,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.oldest
  },
  {
    id: 9,
    name: 'Nkiru',
    numMultipleChoiceCorrect: 7,
    numMultipleChoice: 10,
    numMatchCorrect: 7,
    numMatch: 10,
    isSubmitted: false,
    inProgress: true,
    submissionTimeStamp: testDataTimestamps.inProgress
  },
  {
    id: 10,
    name: 'Karis',
    numMultipleChoiceCorrect: 7,
    numMultipleChoice: 10,
    numMatchCorrect: 7,
    numMatch: 10,
    isSubmitted: false,
    inProgress: false,
    submissionTimeStamp: testDataTimestamps.notStarted
  }
];

// Data for single student multiple choice assessment table
// type: studentWithMCResponsesPropType
export const studentMCData = {
  id: 1,
  name: 'Caley',
  studentResponses: [
    {isCorrect: false, responses: ''},
    {isCorrect: false, responses: 'B D'},
    {isCorrect: false, responses: 'E'},
    {isCorrect: false, responses: 'C'},
    {isCorrect: true, responses: 'A'}
  ]
};

export const matchQuestionWith2Pairs = [
  {
    answers: [
      {
        answer: 'answer 1',
        numAnswered: 6,
        isCorrect: false
      },
      {
        answer: 'answer 2',
        numAnswered: 0,
        isCorrect: true
      }
    ],
    id: 0,
    option: 'option 1',
    notAnswered: 1,
    totalAnswered: 7
  },
  {
    answers: [
      {
        answer: 'answer 1',
        numAnswered: 2,
        isCorrect: true
      },
      {
        answer: 'answer 2',
        numAnswered: 4,
        isCorrect: false
      }
    ],
    id: 1,
    option: 'option 2',
    notAnswered: 1,
    totalAnswered: 7
  }
];

export const matchQuestionWith4Pairs = [
  {
    answers: [
      {
        answer: 'answer 1',
        numAnswered: 6,
        isCorrect: false
      },
      {
        answer: 'answer 2',
        numAnswered: 0,
        isCorrect: true
      },
      {
        answer: 'answer 3',
        numAnswered: 6,
        isCorrect: false
      },
      {
        answer: 'answer 4',
        numAnswered: 0,
        isCorrect: false
      }
    ],
    id: 0,
    option: 'option 1',
    notAnswered: 3,
    totalAnswered: 15
  },
  {
    answers: [
      {
        answer: 'answer 1',
        numAnswered: 5,
        isCorrect: true
      },
      {
        answer: 'answer 2',
        numAnswered: 5,
        isCorrect: false
      },
      {
        answer: 'answer 3',
        numAnswered: 6,
        isCorrect: false
      },
      {
        answer: 'answer 4',
        numAnswered: 5,
        isCorrect: false
      }
    ],
    id: 1,
    option: 'option 2',
    notAnswered: 0,
    totalAnswered: 15
  },
  {
    answers: [
      {
        answer: 'answer 1',
        numAnswered: 0,
        isCorrect: false
      },
      {
        answer: 'answer 2',
        numAnswered: 15,
        isCorrect: true
      },
      {
        answer: 'answer 3',
        numAnswered: 0,
        isCorrect: false
      },
      {
        answer: 'answer 4',
        numAnswered: 0,
        isCorrect: false
      }
    ],
    id: 2,
    option: 'option 3',
    notAnswered: 0,
    totalAnswered: 15
  },
  {
    answers: [
      {
        answer: 'answer 1',
        numAnswered: 1,
        isCorrect: false
      },
      {
        answer: 'answer 2',
        numAnswered: 1,
        isCorrect: false
      },
      {
        answer: 'answer 3',
        numAnswered: 1,
        isCorrect: false
      },
      {
        answer: 'answer 4',
        numAnswered: 0,
        isCorrect: true
      }
    ],
    id: 3,
    option: 'option 4',
    notAnswered: 12,
    totalAnswered: 15
  }
];

// Data for multiple choice overview table
export const multipleChoiceData = [
  {
    id: 1,
    question: 'What is a variable?',
    answers: [
      {
        multipleChoiceOption: i18n.answerOptionA(),
        percentAnswered: 40,
        isCorrectAnswer: true
      },
      {
        multipleChoiceOption: i18n.answerOptionB(),
        percentAnswered: 20,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionC(),
        percentAnswered: 20,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionD(),
        percentAnswered: 20,
        isCorrectAnswer: false
      }
    ],
    notAnswered: 10
  },
  {
    id: 2,
    question: 'What is a 4-bit number for the decimal number Ten(10)?',
    answers: [
      {
        multipleChoiceOption: i18n.answerOptionA(),
        percentAnswered: 30,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionB(),
        percentAnswered: 10,
        isCorrectAnswer: true
      },
      {
        multipleChoiceOption: i18n.answerOptionC(),
        percentAnswered: 10,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionD(),
        percentAnswered: 10,
        isCorrectAnswer: true
      },
      {
        multipleChoiceOption: i18n.answerOptionE(),
        percentAnswered: 20,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionF(),
        percentAnswered: 10,
        isCorrectAnswer: false
      }
    ],
    notAnswered: 30
  },
  {
    id: 3,
    question:
      'What is the minimum number of bits you will need to encode the 26 letters of the alphabet plus a space?',
    answers: [
      {
        multipleChoiceOption: i18n.answerOptionA(),
        percentAnswered: 50,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionB(),
        percentAnswered: 15,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionC(),
        percentAnswered: 20,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionD(),
        percentAnswered: 5,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionE(),
        percentAnswered: 5,
        isCorrectAnswer: true
      }
    ],
    notAnswered: 5
  },
  {
    id: 4,
    question:
      'What is the best explanation for why digital data is represented in computers in binary?',
    answers: [
      {
        multipleChoiceOption: i18n.answerOptionA(),
        percentAnswered: 15,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionB(),
        percentAnswered: 18,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionC(),
        percentAnswered: 10,
        isCorrectAnswer: true
      },
      {
        multipleChoiceOption: i18n.answerOptionD(),
        percentAnswered: 9,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionE(),
        percentAnswered: 5,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionF(),
        percentAnswered: 32,
        isCorrectAnswer: true
      },
      {
        multipleChoiceOption: i18n.answerOptionG(),
        percentAnswered: 5,
        isCorrectAnswer: false
      }
    ],
    notAnswered: 33
  },
  {
    id: 5,
    question: 'What is a function?',
    answers: [
      {
        multipleChoiceOption: i18n.answerOptionA(),
        percentAnswered: 15,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionB(),
        percentAnswered: 18,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionC(),
        percentAnswered: 10,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionD(),
        percentAnswered: 9,
        isCorrectAnswer: false
      },
      {
        multipleChoiceOption: i18n.answerOptionE(),
        percentAnswered: 5,
        isCorrectAnswer: true
      }
    ],
    notAnswered: 25
  }
];

// Data for single student table.
// Array of questionStructurePropType from SingleStudendAssesmentsMCTable
export const multipleChoiceDataForSingleStudent = multipleChoiceData.map(
  (question, index) => {
    return {
      id: question.id,
      question: question.question,
      questionNumber: index + 1,
      correctAnswer: ['C', 'C B', 'D', 'B', 'A'][index]
    };
  }
);

// Data for single match question student table.
export const matchDataForSingleStudent = {
  id: 123,
  question: 'Can you match these?',
  questionNumber: 1,
  answers: [{text: 'answer 1'}, {text: 'answer 2'}],
  options: [{text: 'option 1'}, {text: 'option 2'}]
};

// Data for free responses assessments table.
export const questionOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: ' '
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    response: `Trees live in your fan brush, but you have to scare them out. Use absolutely no pressure. Just like an angel's wing. You can't have light without dark. You can't know happiness unless you've known sorrow. If you didn't have baby clouds, you wouldn't have big clouds. It is a lot of fun. We'll put all the little clouds in and let them dance around and have fun. And right there you got an almighty cloud. We don't have to be committed. We are just playing here. A tree cannot be straight if it has a crooked trunk. Let your heart take you to wherever you want to be. No worries. No cares. Just float and wait for the wind to blow you around. Put light against light - you have nothing. Put dark against dark - you have nothing. It's the contrast of light and dark that each give the other one meaning. This is truly an almighty mountain. The only thing worse than yellow snow is green snow. Paint anything you want on the canvas. Create your own world. You don't have to be crazy to do this but it does help. Tree trunks grow however makes them happy. Now let's put some happy little clouds in here. In your imagination you can go anywhere you want. It's so important to do something every day that will make you happy. Almost everything is going to happen for you automatically - you don't have to spend any time working or worrying. I'm a water fanatic. I love water.
    We wash our brush with odorless thinner. A beautiful little sunset. All you have to learn here is how to have fun. Let's go up in here, and start having some fun Trees get lonely too, so we'll give him a little friend. There are no limits in this world. See. We take the corner of the brush and let it play back-and-forth. The little tiny Tim easels will let you down. Steve wants reflections, so let's give him reflections. It's beautiful - and we haven't even done anything to it yet. Just think about these things in your mind - then bring them into your world. We start with a vision in our heart, and we put it on canvas. I can't think of anything more rewarding than being able to express yourself to others through painting,`
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'Go out on a limb - that is where the fruit is.'
  },
  {
    id: 4,
    studentId: '213',
    name: 'BrendanBrendanBrendanBrendan',
    response: `We do not make mistakes we just have happy little accidents. Once you learn the technique,
        ohhh! Turn you loose on the world; you become a tiger.,`
  }
];

// Data for free responses assessments table.
export const questionTwo = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'In every walk with nature, one receives far more than one seeks'
  }
];

// Data for free responses assessments table.
export const questionThree = [
  {
    id: 1,
    studentId: '210',
    name: 'Maddie',
    response: ' '
  }
];

// Data for free responses survey table.
export const surveyOne = [
  {
    index: 0,
    response:
      'Sea lettuce gumbo grape kale kombu cauliflower salsify kohlrabi okra sea lettuce broccoli celery lotus root carrot winter purslane turnip greens garlic.'
  },
  {
    index: 1,
    response:
      'Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette tatsoi pea sprouts fava bean collard greens dandelion okra wakame tomato.'
  },
  {
    index: 2,
    response:
      'Pea horseradish azuki bean lettuce avocado asparagus okra. Kohlrabi radish okra azuki bean corn fava bean mustard tigernut jícama green bean celtuce collard greens avocado quandong fennel gumbo black-eyed pea.'
  },
  {
    index: 3,
    response:
      'Celery quandong swiss chard chicory earthnut pea potato. Salsify taro catsear garlic gram celery bitterleaf wattle seed collard greens nori.'
  },
  {
    index: 4,
    response:
      'Turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale.'
  }
];

// Data for free reponses for survey table
export const surveyTwo = [
  {
    index: 0,
    response: 'In every walk with nature, one receives far more than one seeks'
  },
  {
    index: 1,
    response: 'In every walk with nature, one receives far more than one seeks'
  },
  {
    index: 2,
    response: 'In every walk with nature, one receives far more than one seeks'
  }
];
