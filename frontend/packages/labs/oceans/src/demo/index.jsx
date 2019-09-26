import 'babel-polyfill';
import MLActivities from '../MLActivities.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

const renderElement = document.getElementById('ml-activities');
ReactDOM.render(<MLActivities />, renderElement);
