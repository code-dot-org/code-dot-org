import React, {useRef} from 'react';
import style from './library.module.scss';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

export default function LibraryIdCopier({channelId}: {channelId: string}) {
  const textContainer = useRef<HTMLInputElement>(null);
  function handleCopyClick() {
    // textContainer.current will be null prior to render. This is ok since nothing will be
    // clickable at that point anyway.
    textContainer.current?.select();
    navigator.clipboard.writeText(channelId);
  }

  return (
    <>
      <input
        type="text"
        ref={textContainer}
        onClick={event => event.currentTarget.select()}
        readOnly
        value={channelId}
        className={style.idTextbox}
      />
      <Button
        onClick={handleCopyClick}
        text={i18n.copyId()}
        className={style.copyButton}
      />
    </>
  );
}
