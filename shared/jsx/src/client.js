import React from 'react';
import ReactDOM from 'react-dom';

import { mountComponents } from 'react-sinatra-ujs';

import Hello from './components/Hello';

addEventListener('load', function() { mountComponents({ Hello: Hello }) }, false);
