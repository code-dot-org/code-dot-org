import {Typography} from '@mui/material';
import {useState} from 'react';

import {RadioButtonsGroup} from '@code-dot-org/component-library/radioButton';
import Toggle from '@code-dot-org/component-library/toggle';

import {scenarios} from './scenarios';

import moduleStyles from './demo.module.css';

/**
 * Dev playground for the markdown component. Pick a scenario on the left to see
 * it render on the right, and toggle the design-system theme. Built from the
 * design system: DSCO controls (RadioButtonsGroup, Toggle) and MUI Typography.
 * The previewed scenario area bridges to the design-system CSS variables via
 * `data-theme` so the markdown reflects the chosen theme.
 */
export const Demo = () => {
  const [selected, setSelected] = useState(scenarios[0].id);
  const [theme, setTheme] = useState<'Light' | 'Dark'>('Light');
  const current =
    scenarios.find(scenario => scenario.id === selected) ?? scenarios[0];

  return (
    <div className={moduleStyles.layout}>
      <nav className={moduleStyles.nav}>
        <Typography variant="h6" component="h2">
          Scenarios
        </Typography>
        <RadioButtonsGroup
          defaultValue={scenarios[0].id}
          onChange={event => setSelected(event.target.value)}
          radioButtons={scenarios.map(scenario => ({
            name: 'scenario',
            value: scenario.id,
            label: scenario.name,
          }))}
        />
        <div className={moduleStyles.themeToggle}>
          <Toggle
            name="theme"
            label="Dark mode"
            checked={theme === 'Dark'}
            onChange={event =>
              setTheme(event.target.checked ? 'Dark' : 'Light')
            }
          />
        </div>
      </nav>
      <main
        className={moduleStyles.preview}
        data-testid="scenario"
        data-theme={theme}
      >
        {current.render()}
      </main>
    </div>
  );
};

export default Demo;
