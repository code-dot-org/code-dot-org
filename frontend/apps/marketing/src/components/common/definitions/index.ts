export const marginBottomNoneToMDefinition = {
  displayName: 'Bottom Margin',
  type: 'Text',
  defaultValue: 'xs',
  group: 'style',
  validations: {
    in: [
      {value: 'none', displayName: '0px (None)'},
      {value: 'xs', displayName: '8px (Extra Small)'},
      {value: 's', displayName: '16px (Small)'},
      {value: 'm', displayName: '24px (Medium)'},
    ],
  },
};

export const marginBottomNoneToLDefinition = {
  ...marginBottomNoneToMDefinition,
  validations: {
    in: [
      ...marginBottomNoneToMDefinition.validations.in,
      {value: 'l', displayName: '40px (Large)'},
    ],
  },
};
