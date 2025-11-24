import {Button} from '@code-dot-org/component-library/button';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import WidgetTemplate from './widgetTemplate';

import styles from './studentSnapshot.module.scss';

const StudentSnapshot: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const dropdownOptions = [
    {value: 'option1', text: 'Option 1'},
    {value: 'option2', text: 'Option 2'},
    {value: 'option3', text: 'Option 3'},
  ];
  return (
    <div className={styles.snapshotContainer}>
      <div className={styles.header}>
        <div className={styles.headerColumn}>
          <SimpleDropdown
            labelText="Unit"
            name="test"
            items={dropdownOptions}
            selectedValue={selectedOption}
            onChange={event => setSelectedOption(event.target.value)}
            placeholder="Select an option"
            className={styles.dropdown}
          />
          <SimpleDropdown
            labelText="Lesson"
            name="test"
            items={dropdownOptions}
            selectedValue={selectedOption}
            onChange={event => setSelectedOption(event.target.value)}
            placeholder="Select an option"
            className={styles.dropdown}
          />
          <div className={styles.buttonGroup}>
            <Button
              className={styles.button}
              text="< Previous lesson"
              onClick={() => alert('Button clicked!')}
              color="gray"
              type="secondary"
            />
            <Button
              className={styles.button}
              text="Next lesson >"
              onClick={() => alert('Button clicked!')}
              color="gray"
              type="secondary"
            />
          </div>
        </div>

        <div className={styles.headerColumn}>
          <SimpleDropdown
            labelText="Show students by"
            name="test"
            items={dropdownOptions}
            selectedValue={selectedOption}
            onChange={event => setSelectedOption(event.target.value)}
            placeholder="Select an option"
            className={styles.dropdown}
          />
          <SimpleDropdown
            labelText="Student"
            name="test"
            items={dropdownOptions}
            selectedValue={selectedOption}
            onChange={event => setSelectedOption(event.target.value)}
            placeholder="Select an option"
            className={styles.dropdown}
          />
          <div className={styles.buttonGroup}>
            <Button
              className={styles.button}
              text="< Previous student"
              onClick={() => alert('Button clicked!')}
              color="gray"
              type="secondary"
            />
            <Button
              className={styles.button}
              text="Next student >"
              onClick={() => alert('Button clicked!')}
            />
          </div>
        </div>
      </div>

      <Typography
        variant="h3"
        className={styles.studentNameHeader}
        gutterBottom
      >
        <Typography variant="strong">{'<Student name>'}</Typography>
      </Typography>

      <div className={styles.widgetGrid}>
        <WidgetTemplate widgetName="Long Widget" gridWidth={3} gridHeight={1}>
          <div>content</div>
        </WidgetTemplate>
        <WidgetTemplate widgetName="Big Widget" gridWidth={2} gridHeight={2}>
          <div>big content</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 1"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 1</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 2"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 2</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 3"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 3</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 4"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 4</div>
        </WidgetTemplate>
      </div>
    </div>
  );
};

export default StudentSnapshot;
