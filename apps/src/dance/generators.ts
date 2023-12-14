import {Block} from 'blockly';
import {DANCE_AI_FIELD_NAME} from './ai/constants';

type Generator = (block: Block) => string | string[];

const generators: {[blockName: string]: Generator} = {
  ai: (block: Block) => {
    return `
      // Custom block generators allow us to perform some other complex logic

      // const value = API.getSomeValue(block.getFieldValue('some_field'));
      // API.setSomeValue(value);
      // API.prepareForAi(block.id);

      ai(${block.getFieldValue(DANCE_AI_FIELD_NAME)});
      
      // API.endAi();
      `;
  },
};

export default generators;
