import React, {useState} from 'react';

const PromptCustomization = () => {
  const [temperature, setTemperature] = useState(25);

  const handleTemperatureChange = event => {
    setTemperature(event.target.value);
  };

  return (
    <>
      <label htmlFor="chatbot-name">Chatbot name</label>
      <input id="chatbot-name" />
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <label htmlFor="temperature">Temperature</label>
        {temperature}
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={temperature}
        onChange={handleTemperatureChange}
      />
      <label htmlFor="system-prompt">System prompt</label>
      <textarea
        id="system-prompt"
        style={{width: 'calc(100% - 20px)', resize: 'vertical'}}
      />
    </>
  );
};

export default PromptCustomization;
