import React, {useEffect, useState} from 'react';
// import PropTypes from 'prop-types';
import {openaiCompletion} from '@cdo/apps/util/openai';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export const AiTab = props => {
  // const {
  //   teacherOnly,
  // } = props;

  const [result, setResult] = useState(null);

  useEffect(() => {
    const prompt = `Please evaluate and briefly summarize whether each of the
    following statements are true or false with respect to the code for my
    program which follows. Please give your response formatted as a markdown
    table with the following columns: "Statement", "True/False", and "Reason". 
    please use backticks to escape any code in your reason.

    statements:
    
    ${exampleStatements}
    
    code:
    
    ${exampleCode}`;

    openaiCompletion(prompt).then(setResult);
  }, []);

  return (
    <div>
      {!result && <div>loading...</div>}
      {result && (
        <div>
          <SafeMarkdown markdown={result} />
        </div>
      )}
    </div>
  );
};

const exampleStatements = `
1. You used multiple sprites
2. Your program uses at least one random number
3. Your program uses multiple conditionals inside the draw loop 
4. At least one variable or property uses the counter pattern
`;

const exampleCode = `
//Sprites
var moving_crutch = createSprite(100, 300);
moving_crutch.setAnimation("crutch_1");

var stable_crutch = createSprite(330, 300);
stable_crutch.setAnimation("crutch_1");

//x position for bunny, moving crutch, and stable crutch
var x_position = 200;

//Code to draw background
function draw() {
  //random number for rotation
  var randomDegrees = randomNumber(-10, 10);
  
  //move the crutch left or right based on user input and rotate randomly
  //since keyWentDown is used, the user must repeatedly press the keys
  if (keyWentDown("right")) {
    moving_crutch.x += 10;
    moving_crutch.rotation = randomDegrees;
  }
  if (keyWentDown("left")){
    moving_crutch.x -=10;
    moving_crutch.rotation = randomDegrees;
  }
    
  //Draw Sprites and text
  drawSprites();
}
`;
