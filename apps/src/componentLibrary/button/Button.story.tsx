/* eslint-disable storybook/default-exports */
// TODO: Once start working on Button component - uncomment the code and use it as a template for Button component stories

// import React from 'react';
// import Button, {ButtonProps} from './index';
// import {Meta, Story} from '@storybook/react';
// import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
//
// export default {
//   title: 'DesignSystem/Button Component',
//   component: Button,
// } as Meta;
//
// //
// // TEMPLATE
// //
// // This is needed to fix children type error (passing string instead of React.ReactNode type)
// // eslint-disable-next-line
// const SingleTemplate: Story<ButtonProps> = args => <Button {...args} />;
//
// const MultipleTemplate: Story<{
//   components: ButtonProps[];
// }> = args => (
//   <>
//     {args.components?.map(componentArg => (
//       // TODO: fix key
//       <Button key={componentArg.size} {...componentArg} />
//     ))}
//   </>
// );
//
// export const DefaultButton = SingleTemplate.bind({});
// DefaultButton.args = {
//   size: 'm',
// };
//
// export const GroupOfSizesOfButtons = MultipleTemplate.bind({});
// GroupOfSizesOfButtons.args = {
//   components: [
//     {
//       size: 'xs',
//     },
//     {
//       size: 's',
//     },
//     {
//       size: 'm',
//     },
//     {
//       size: 'l',
//     },
//   ],
// };
