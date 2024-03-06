import React, {useState} from 'react';

const PromptCustomization = () => {
  const [temperature, setTemperature] = useState(0.05);

  const handleTemperatureChange = event => {
    setTemperature(event.target.value);
  };

  return (
    <div
      id="flex-container"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div id="top-container" style={{height: 400}}>
        <div style={{padding: '5px 0'}}>
          <label htmlFor="chatbot-name">Chatbot name</label>
          <input
            id="chatbot-name"
            style={{width: '100%', boxSizing: 'border-box'}}
          />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <label htmlFor="temperature">Temperature</label>
          {temperature}
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={temperature}
          onChange={handleTemperatureChange}
          style={{width: '100%'}}
        />
        <label htmlFor="system-prompt">System prompt</label>
        <textarea
          id="system-prompt"
          style={{width: 'calc(100% - 20px)', height: 100, resize: 'vertical'}}
        />
      </div>
      <div
        id="bottom-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button>Update</button>
      </div>
    </div>
  );
};

export default PromptCustomization;
