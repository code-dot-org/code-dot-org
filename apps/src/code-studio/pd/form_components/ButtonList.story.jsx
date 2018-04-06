import React from 'react';
import ButtonList from './ButtonList';

export default storybook => {
  return storybook
  .storiesOf('FormComponents/Pd ButtonList', module)
  .addDecorator((story) => (
    // Currently the Bootstrap 3 styles required by React-Bootstrap are only applied inside div#workshop-container.
    // This is to prevent conflicts with other parts of Code Studio using Bootstrap 2.
    // See pd.scss. Without this container div it won't render properly.
    <div id="workshop-container">
      {story()}
    </div>
  ))
  .addStoryTable([
    {
      name: "Radio Buttons",
      story: () => (
        <ButtonList
          type="radio"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            "Cat",
            "Dog"
          ]}
        />
      )
    },
    {
      name: "Checkboxes",
      story: () => (
        <ButtonList
          type="check"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            "Cat",
            "Dog"
          ]}
        />
      )
    },
    {
      name: "includeOther",
      story: () => (
        <ButtonList
          type="check"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            "Cat",
            "Dog"
          ]}
          includeOther={true}
        />
      )
    },
    {
      name: "with custom inputs",
      story: () => (
        <ButtonList
          type="check"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            "Cat",
            {
              answerText: "Specific dog breed",
              inputId: "dog-breed-input"
            }
          ]}
        />
      )
    }
  ]);
};
