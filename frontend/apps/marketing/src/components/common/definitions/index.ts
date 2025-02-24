export const marginBottomNoneToMDefinition = {
  displayName: 'Margin bottom',
  type: 'Text',
  defaultValue: 'xs',
  group: 'style',
  validations: {
    in: [
      {value: 'none', displayName: 'None'},
      {value: 'xs', displayName: 'Extra Small'},
      {value: 's', displayName: 'Small'},
      {value: 'm', displayName: 'Medium'},
    ],
  },
};
