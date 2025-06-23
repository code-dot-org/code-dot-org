import {Meta, StoryFn} from '@storybook/react';
import {useState} from 'react';

import {Button} from '@/button';

import CustomDialog, {CustomDialogProps} from '../CustomDialog';

export default {
  title: 'DesignSystem/Dialog/CustomDialog',
  component: CustomDialog,
} as Meta;

//
// SINGLE TEMPLATE
//
const SingleTemplate: StoryFn<CustomDialogProps> = args => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} text="Open Dialog" />
      {isOpen && (
        <CustomDialog
          {...args}
          onClose={() => {
            setIsOpen(false);
            args.onClose?.();
          }}
        >
          <div style={{width: 500, height: 500}}>
            {args.children || (
              <div id="dsco-dialog-description">
                This is the content of the Custom Dialog.
              </div>
            )}
          </div>
        </CustomDialog>
      )}
    </div>
  );
};

//
// MULTIPLE TEMPLATE
//
const MultipleTemplate: StoryFn<{
  components: CustomDialogProps[];
}> = args => {
  const [values, setValues] = useState({} as Record<string, boolean>);

  return (
    <div>
      <p>
        * Margins on this screen do not represent the component's margins, and
        are only added to improve Storybook view *
      </p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {args.components?.map((componentArg, index) => (
          <div key={index}>
            <Button
              onClick={() => setValues({...values, [`dialog-${index}`]: true})}
              text={`Open ${componentArg.title || 'Dialog'}`}
            />
            {values[`dialog-${index}`] && (
              <CustomDialog
                {...componentArg}
                onClose={() =>
                  setValues({...values, [`dialog-${index}`]: false})
                }
              >
                <div style={{width: 500, height: 500}}>
                  {componentArg.children || (
                    <div id="dsco-dialog-description">
                      This is the content of the Custom Dialog.
                    </div>
                  )}
                </div>
              </CustomDialog>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

//
// STORIES
//

export const DefaultCustomDialog = SingleTemplate.bind({});
DefaultCustomDialog.args = {
  title: 'Default Custom Dialog',
  mode: 'light',
  children: 'This is a simple Custom Dialog without additional props.',
  onClose: () => console.log('Dialog closed'),
};

export const DarkModeCustomDialog = SingleTemplate.bind({});
DarkModeCustomDialog.args = {
  title: 'Dark Mode Dialog',
  mode: 'dark',
  children: 'This dialog uses the dark mode theme.',
  onClose: () => console.log('Dark mode dialog closed'),
};

export const CustomDialogWithCustomContent = SingleTemplate.bind({});
CustomDialogWithCustomContent.args = {
  title: 'Dialog with Custom Content',
  children: (
    <div>
      <p id="dsco-dialog-description">
        This is custom content rendered inside the dialog. You can put anything
        here.
      </p>
      <ul>
        <li>Custom List Item 1</li>
        <li>Custom List Item 2</li>
      </ul>
    </div>
  ),
  onClose: () => console.log('Dialog with custom content closed'),
};

export const MultipleCustomDialog = MultipleTemplate.bind({});
MultipleCustomDialog.args = {
  components: [
    {
      title: 'Light Mode Dialog',
      mode: 'light',
      children: (
        <p id="dsco-dialog-description">'Content for the light mode dialog.'</p>
      ),
      onClose: () => console.log('Light mode dialog closed'),
    },
    {
      title: 'Dark Mode Dialog',
      mode: 'dark',
      children: (
        <p id="dsco-dialog-description">'Content for the dark mode dialog.'</p>
      ),
      onClose: () => console.log('Dark mode dialog closed'),
    },
    {
      title: 'Custom Content Dialog',
      mode: 'light',
      children: (
        <div>
          <p id="dsco-dialog-description">Here is some custom content!</p>
          <ul>
            <li>Item A</li>
            <li>Item B</li>
          </ul>
        </div>
      ),
      onClose: () => console.log('Custom content dialog closed'),
    },
  ],
};
