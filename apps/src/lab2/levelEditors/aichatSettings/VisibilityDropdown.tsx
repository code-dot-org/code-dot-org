import React, {useContext} from 'react';

import {AiCustomizations, Visibility} from '@cdo/apps/aichat/types';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';

import {UpdateContext} from './UpdateContext';

const VisibilityDropdown: React.FunctionComponent<{
  value: Visibility;
  property: keyof AiCustomizations;
}> = ({value, property}) => {
  const {setPropertyVisibility} = useContext(UpdateContext);
  return (
    <SimpleDropdown
      selectedValue={value}
      labelText="Visibility"
      name="bot_name_visibility"
      size="s"
      items={[
        {value: Visibility.EDITABLE, text: 'Editable'},
        {value: Visibility.READONLY, text: 'Read Only'},
        {value: Visibility.HIDDEN, text: 'Hidden'},
      ]}
      onChange={e => {
        setPropertyVisibility(property, e.target.value as Visibility);
      }}
    />
  );
};

export default VisibilityDropdown;
