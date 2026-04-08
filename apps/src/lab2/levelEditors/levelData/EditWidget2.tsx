import React, {useState} from 'react';

import {Widget2} from '@cdo/apps/weblab2/types';

import RawJsonEditor from './RawJsonEditor';

interface EditWidget2Props {
  initialValue: Widget2 | undefined;
  widget2Ids: string[];
}

const EditWidget2: React.FunctionComponent<EditWidget2Props> = ({
  initialValue,
  widget2Ids,
}) => {
  const [widget2, setWidget2] = useState<Widget2 | undefined>(initialValue);

  return (
    <>
      <input
        type="hidden"
        id="widget2"
        name="level[widget2]"
        value={JSON.stringify(widget2 || {})}
      />

      <select
        value={widget2?.id || ''}
        onChange={e =>
          e.target.value
            ? setWidget2({...widget2, id: e.target.value} as Widget2)
            : setWidget2(undefined)
        }
      >
        <option value="">-- none --</option>
        {widget2Ids.map(widget2Id => (
          <option key={widget2Id} value={widget2Id}>
            {widget2Id}
          </option>
        ))}
      </select>

      <p>
        If one is selected, the level will be in Widget2 View. As in the above
        Original Widget View, the code editor workspace is hidden. To see/edit
        the list of available widgets2s, go to the{' '}
        <a href="/widget2" target="_blank">
          Widget2 Library
        </a>
        .
      </p>

      {widget2 && (
        <>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>Parameters (JSON)</label>
          <RawJsonEditor
            currentValue={widget2?.parameters}
            fieldName="widget2"
            onChange={newValue =>
              setWidget2({...widget2, parameters: newValue} as Widget2)
            }
          />
          These parameters will be available to code inside the widget as{' '}
          <code>window._parameters</code>.
        </>
      )}
    </>
  );
};

export default EditWidget2;
