import React from 'react';
import FreeResponsesAssessments from './FreeResponsesAssessments';

const questionOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: ' ',
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
    response: 'Go out on a limb - that is where the fruit is.',
  },
  {
    id: 4,
    studentId: '213',
    name: 'BrendanBrendan',
    response: `We do not make mistakes we just have happy little accidents. Once you learn the technique,
        ohhh! Turn you loose on the world; you become a tiger.,`
  },
];

const questionTwo = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'In every walk with nature, one receives far more than one seeks',
  },
];

const questionThree = [
  {
    id: 1,
    studentId: '210',
    name: 'Maddie',
    response: ' ',
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/FreeResponsesAssessments', module)
    .addStoryTable([
      {
        name: 'Free responses for question 1',
        description: 'Display responses of all students',
        story: () => (
          <FreeResponsesAssessments
            freeResponses={questionOne}
          />
        )
      },
      {
        name: 'Free responses for question 2',
        description: 'Display table if at least one student completes assessment',
        story: () => (
          <FreeResponsesAssessments
            freeResponses={questionTwo}
          />
        )
      },
      {
        name: 'Free responses for assessments',
        description: 'Student assessment submitted without response',
        story: () => (
          <FreeResponsesAssessments
            freeResponses={questionThree}
          />
        )
      },
    ]);

};
