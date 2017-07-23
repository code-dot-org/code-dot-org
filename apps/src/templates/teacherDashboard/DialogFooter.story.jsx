import React from 'react';
import DialogFooter from "./DialogFooter";
import ProgressButton from '../progress/ProgressButton';

export default storybook => storybook
  .storiesOf('DialogFooter', module)
  .addStoryTable([
    {
      name: 'One button',
      description: 'By default, a single child is left-aligned',
      story: () => (
        <DialogFooter>
          <ProgressButton
            href="#"
            text="Cancel"
            size={ProgressButton.ButtonSize.large}
            color={ProgressButton.ButtonColor.gray}
          />
        </DialogFooter>
      ),
    },
    {
      name: 'Two buttons',
      description: 'Two children are put at opposite sides of the footer',
      story: () => (
        <DialogFooter>
          <ProgressButton
            href="#"
            text="Cancel"
            size={ProgressButton.ButtonSize.large}
            color={ProgressButton.ButtonColor.gray}
          />
          <ProgressButton
            href="#"
            text="Continue"
            size={ProgressButton.ButtonSize.large}
          />
        </DialogFooter>
      ),
    },
    {
      name: 'Button groups',
      description: 'To group buttons on one side or the other, group them together with divs.',
      story: () => (
        <DialogFooter>
          <div>
            <ProgressButton
              href="#"
              text="Cancel"
              size={ProgressButton.ButtonSize.large}
              color={ProgressButton.ButtonColor.gray}
            />
          </div>
          <div>
            <ProgressButton
              href="#"
              text="One Fish"
              size={ProgressButton.ButtonSize.large}
            />
            <ProgressButton
              href="#"
              text="Two Fish"
              size={ProgressButton.ButtonSize.large}
              style={{marginLeft: 4}}
            />
          </div>
        </DialogFooter>
      ),
    },
    {
      name: 'Other content',
      description: 'You can actually put anything you want in here',
      story: () => (
        <DialogFooter>
          <em>The road to ruin is paved with good intentions.</em>
        </DialogFooter>
      ),
    },
  ]);
