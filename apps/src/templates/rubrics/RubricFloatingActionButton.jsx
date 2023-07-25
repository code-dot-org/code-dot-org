import React, {useState} from 'react';
import style from './rubrics.module.scss';

export default function RubricFloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="fab-contained">
      <button
        className={style.floatingActionButton}
        style={{}}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      />
      {isOpen && (
        <div style={{position: 'fixed', left: 10, bottom: 108}}>hi</div>
      )}
    </div>
  );
}
