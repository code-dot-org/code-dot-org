import React from 'react';
import DialogButtons from './DialogButtons';

export default function AniGifModal({title, aniGifURL}) {
  return (
    <div>
      <p className="dialog-title">{title}</p>
      <img className="aniGif example-image" src={aniGifURL}/>
      <DialogButtons ok={true}/>
    </div>
  );
}

AniGifModal.propTypes = {
  title: React.PropTypes.string.isRequired,
  aniGifURL: React.PropTypes.string.isRequired,
};
