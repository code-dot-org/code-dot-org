import {getRegisteredFixtureTags} from '@code-dot-org/core/api/mocks';

import {
  SECTIONS_SCENARIO_LABELS,
  TEACHER_DASHBOARD_LAB_KEY,
} from './mocks/scenarios';

export interface ScenarioSelectorProps {
  value: string;
  onChange: (tag: string) => void;
}

/** Dev-shell-only chrome: a corner dropdown that switches the active MSW scenario. */
export default function ScenarioSelector({
  value,
  onChange,
}: ScenarioSelectorProps) {
  const tags = getRegisteredFixtureTags(TEACHER_DASHBOARD_LAB_KEY);
  return (
    <div style={{position: 'fixed', top: 0, right: 0, padding: '0.5rem'}}>
      <label>
        Scenario:{' '}
        <select
          name="scenario"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {tags.map(tag => (
            <option key={tag} value={tag}>
              {SECTIONS_SCENARIO_LABELS[tag] ?? tag}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
