import React from 'react';
import SingleChoiceResponses from './single_choice_responses';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('Single choice responses', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Single choice responses without other',
        story: () => (
          <SingleChoiceResponses
            question="What is your favorite pizza topping?"
            answers={{
              'Peppers': 4,
              'Onions': 13,
              'Mushrooms': 2,
              'Olives': 2,
              'Sausage': 3
            }}
            possibleAnswers={['Peppers', 'Onions', 'Mushrooms', 'Sausage', 'Olives', 'Pineapples']}
            answerType="selectText"
          />
        )
      },
      {
        name: 'Single choice responses with others',
        story: () => (
          <SingleChoiceResponses
            question={"What is your favorite pizza topping? Please provide the topping if it is not listed here"}
            answers={{
              'Peppers': 4,
              'Onions': 13,
              'Mushrooms': 2,
              'Olives': 2,
              'Sausage': 3,
              'Corn': 1,
              'Anything but pineapples lol': 1,
              'Kalamata Olives specifically': 1
            }}
            possibleAnswers={['Peppers', 'Onions', 'Mushrooms', 'Sausage', 'Olives', 'Pineapples']}
            otherText={'Other toppings'}
            answerType="selectText"
          />
        )
      },
      {
        name: 'Single choice selectValue response',
        story: () => (
          <SingleChoiceResponses
            question={"What do you think about pineapples on pizza?"}
            answers={{
              1: 10,
              2: 5,
              3: 1,
              4: 0,
              5: 0
            }}
            answerType="selectValue"
            possibleAnswers={['Abhorrent', 'Not good', 'Ambivalent', 'Good', 'Delicious']}
          />
        )
      },
      {
        name: 'Scale ratings',
        story: () => (
          <SingleChoiceResponses
            question={'How do you feel about deep dish?'}
            answers={{
              1: 1,
              4: 5,
              5: 10
            }}
            answerType="scale"
            possibleAnswers={['1 - I hate it', '2', '3', '4', '5 - I love it']}
          />
        )
      }
    ]);
};
