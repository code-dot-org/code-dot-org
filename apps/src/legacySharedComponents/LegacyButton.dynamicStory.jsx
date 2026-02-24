import {BUTTON_TYPES} from './LegacyButton';

const buttonTypes = Object.keys(BUTTON_TYPES);

const stories = {};

buttonTypes.map(buttonType => {
  stories[`Default_${buttonType}`] = {
    args: {
      type: buttonType,
    },
    parameters: {
      children: 'Button',
    },
  };
  stories[`Large_${buttonType}`] = {
    args: {
      type: buttonType,
      size: 'large',
    },
  };
  stories[`Right_${buttonType}`] = {
    args: {
      type: buttonType,
      size: 'large',
      arrow: 'right',
    },
  };
  stories[`Left_${buttonType}`] = {
    args: {
      type: buttonType,
      size: 'large',
      arrow: 'left',
    },
  };
});

export default {
  baseCsf: `
    import LegacyButton from "./LegacyButton";
    
    export default { component: LegacyButton, args: {children: ['Button'] } };
  `,
  stories: () => stories,
};
