import React from 'react';
import ReactDOM from 'react-dom';
import UploadSong from '@cdo/apps/dancePartyManagement/UploadSong.jsx';

$(document).ready(function() {
  ReactDOM.render(
    <UploadSong />,
    document.getElementById('dance-party-upload-song-container')
  );
});
