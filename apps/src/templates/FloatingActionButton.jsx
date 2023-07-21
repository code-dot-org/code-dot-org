import React, {useState} from 'react';
import propTypes from 'prop-types';

export default function FloatingActionButton({children}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="floating-action-button"
      style={{
        position: 'fixed',
        left: 10,
        bottom: 48,
      }}
    >
      <button
        //className={classNames('floating-action-button', buttonClassName)}}
        style={{
          backgroundColor: 'aquamarine',
          height: 60,
          width: 60,
          padding: 0,
        }}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      />
      {isOpen && (
        <div style={{position: 'fixed', left: 10, bottom: 108}}>{children}</div>
      )}
    </div>
  );
}

FloatingActionButton.propTypes = {
  children: propTypes.node.isRequired,
};
