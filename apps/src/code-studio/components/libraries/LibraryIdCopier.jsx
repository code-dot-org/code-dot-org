import React from 'react';
import style from './library.module.scss';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

export default function LibraryIdCopier({channelId}) {
  let refObject;

  return (
    <>
      <input
        type="text"
        ref={channelId => (refObject = channelId)}
        onClick={event => event.target.select()}
        readOnly
        value={channelId}
        className={style.idTextbox}
      />
      <Button
        onClick={() => {
          refObject.select();
          navigator.clipboard.writeText(channelId);
        }}
        text={i18n.copyId()}
        className={style.copyButton}
      />
    </>
  );
}
