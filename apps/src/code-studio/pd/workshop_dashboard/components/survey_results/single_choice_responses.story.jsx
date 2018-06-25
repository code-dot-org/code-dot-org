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
              'Other': 6
            }}
            possibleAnswers={['Peppers', 'Onions', 'Mushrooms', 'Sausage', 'Olives', 'Pineapples', 'Other']}
            otherAnswers={['Anchovies', 'Kalamata Olives', 'Corn', 'Corn', '', '']}
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
      }
    ])
}
