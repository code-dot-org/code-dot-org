import React, {useState} from 'react';

import RawJsonEditor from './RawJsonEditor';

interface EditWidget2ParametersProps {
  initialValue: object;
}

const EditWidget2Parameters: React.FunctionComponent<
  EditWidget2ParametersProps
> = ({initialValue}) => {
  const fieldName = 'widget2Parameters';

  const [widget2Parameters, setWidget2Parameters] = useState<
    object | undefined
  >(initialValue);

  return (
    <>
      <input
        type="hidden"
        id="widget2_parameters"
        name="level[widget2_parameters]"
        value={JSON.stringify(widget2Parameters)}
      />
      <RawJsonEditor
        currentValue={widget2Parameters}
        fieldName={fieldName}
        onChange={newValue => setWidget2Parameters(newValue)}
      />
    </>
  );
};

export default EditWidget2Parameters;
