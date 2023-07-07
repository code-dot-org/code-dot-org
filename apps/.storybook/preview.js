import $ from 'jquery';
import {initializeRTL} from 'storybook-addon-rtl';

initializeRTL();

// export const parameters = {
//     // actions: {argTypesRegex: '^on[A-Z].*'},
//     // controls: {
//     //     expanded: true,
//     //     // matchers: {
//     //     //     color: /(background|color)$/i,
//     //     //     date: /Date$/,
//     //     // },
//     // }
// }

//Stub jquery fileupload library function
$.fn.fileupload = () => {};
