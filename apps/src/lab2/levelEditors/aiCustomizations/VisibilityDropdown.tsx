import {AiCustomizations, Visibility} from '@cdo/apps/aichat/types';
import React, {useContext} from 'react';
import SimpleDropdown from '@cdo/apps/componentLibrary/simpleDropdown/SimpleDropdown';
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
        {value: 'editable', text: 'Editable'},
        {value: 'readonly', text: 'Read Only'},
        {value: 'hidden', text: 'Hidden'},
      ]}
      onChange={e => {
        setPropertyVisibility(property, e.target.value as Visibility);
      }}
    />
  );
};

export default VisibilityDropdown;
