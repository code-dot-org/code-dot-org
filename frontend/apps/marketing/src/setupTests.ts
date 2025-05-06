import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';
import {TextEncoder} from 'node:util';

global.TextEncoder = TextEncoder;
