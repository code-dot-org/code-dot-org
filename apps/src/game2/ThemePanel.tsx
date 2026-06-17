import React, {useState} from 'react';

import moduleStyles from './game2View.module.scss';

const ThemePanel: React.FunctionComponent = () => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    // TODO: Handle theme submission
  };

  return (
    <div className={moduleStyles.themePanel}>
      <input
        className={moduleStyles.themeInput}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Describe your project..."
      />
      <button
        type="button"
        className={moduleStyles.themeSubmit}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default ThemePanel;
