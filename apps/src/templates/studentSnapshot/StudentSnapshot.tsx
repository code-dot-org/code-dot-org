import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useState} from 'react';

const StudentSnapshot: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const dropdownOptions = [
    {value: 'option1', text: 'Option 1'},
    {value: 'option2', text: 'Option 2'},
    {value: 'option3', text: 'Option 3'},
  ];

  return (
    <div>
      <SimpleDropdown
        labelText="test dropdown"
        name="test"
        items={dropdownOptions}
        selectedValue={selectedOption}
        onChange={event => setSelectedOption(event.target.value)}
        placeholder="Select an option"
      />
    </div>
  );
};

export default StudentSnapshot;
