import $ from 'jquery';
import {initializeRTL} from 'storybook-addon-rtl';

initializeRTL();

//Stub jquery fileupload library function
$.fn.fileupload = () => {};
