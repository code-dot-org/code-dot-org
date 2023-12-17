import PropTypes from 'prop-types';
import React from 'react';
var msg = require('./locale');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var SpellingControls = function (props) {
  return (
    <ProtectedStatefulDiv id="spelling-table-wrapper">
      <table id="spelling-table" className="float-right">
        <tbody>
          <tr>
            <td className="spellingTextCell">{msg.word()}:</td>
            <td className="spellingButtonCell">
              <button
                type="button"
                id="searchWord"
                className="spellingButton"
                disabled
              >
                <img src="/blockly/media/1x1.gif" alt="" />
                {props.searchWord}
              </button>
            </td>
          </tr>
          <tr>
            <td className="spellingTextCell">{msg.youSpelled()}:</td>
            <td className="spellingButtonCell">
              <button
                type="button"
                id="currentWord"
                className="spellingButton"
                disabled
              >
                {
                  // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
                  // Verify or update this alt-text as necessary
                }
                <img src="/blockly/media/1x1.gif" alt="" />
                <span id="currentWordContents" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </ProtectedStatefulDiv>
  );
};

SpellingControls.propTypes = {
  searchWord: PropTypes.string.isRequired,
};

module.exports = SpellingControls;
