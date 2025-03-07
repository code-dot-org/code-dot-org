import Button from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import RegionalPartnerContactNewDialog from './RegionalPartnerContactNewDialog';

export default {
  component: RegionalPartnerContactNewDialog,
};

const DialogTemplate = args => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} text="Open Dialog" />
      {isOpen && (
        <RegionalPartnerContactNewDialog
          {...args}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export const DialogDefault = DialogTemplate.bind({});
DialogDefault.args = {
  zip: '00000',
  notes: 'test notes',
  sourcePageId: 'homepage',
  onClose: () => console.log('Dialog closed'),
};
