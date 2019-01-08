'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from "react-dom/server";

import Hello from './components/Hello'

// To load on server runtime
global.Hello = Hello;
