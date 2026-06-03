import {useState} from 'react';

import {scenarios} from './scenarios';

/**
 * Dev playground for the markdown component. Pick a scenario on the left to see
 * it render on the right, and toggle the design-system theme. The scenarios are
 * shared with the visual tests.
 */
export const Demo = () => {
  const [selected, setSelected] = useState(scenarios[0].id);
  const [theme, setTheme] = useState<'Light' | 'Dark'>('Light');
  const current =
    scenarios.find(scenario => scenario.id === selected) ?? scenarios[0];

  return (
    <div style={{display: 'flex', fontFamily: 'sans-serif', gap: 32}}>
      <nav style={{flex: '0 0 auto'}}>
        <h2 style={{fontSize: 16}}>Scenarios</h2>
        {scenarios.map(scenario => (
          <label key={scenario.id} style={{display: 'block', padding: '2px 0'}}>
            <input
              type="radio"
              name="scenario"
              value={scenario.id}
              checked={scenario.id === selected}
              onChange={() => setSelected(scenario.id)}
            />{' '}
            {scenario.name}
          </label>
        ))}
        <label style={{display: 'block', marginTop: 16}}>
          <input
            type="checkbox"
            checked={theme === 'Dark'}
            onChange={event =>
              setTheme(event.target.checked ? 'Dark' : 'Light')
            }
          />{' '}
          Dark mode
        </label>
      </nav>
      <main
        data-testid="scenario"
        data-theme={theme}
        style={{
          background: 'var(--background-neutral-primary)',
          color: 'var(--text-neutral-primary)',
          flex: '1 1 auto',
          maxWidth: 640,
          padding: 16,
        }}
      >
        {current.render()}
      </main>
    </div>
  );
};

export default Demo;
