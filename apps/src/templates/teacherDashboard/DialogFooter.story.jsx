import React from 'react';
import DialogFooter from "./DialogFooter";
import Button from '../Button';

export default storybook => storybook
  .storiesOf('DialogFooter', module)
  .addStoryTable([
    {
      name: 'One button',
      description: 'By default, a single child is left-aligned',
      story: () => (
        <DialogFooter>
          <Button
            href="#"
            text="Cancel"
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      ),
    },
    {
      name: 'Two buttons',
      description: 'Two children are put at opposite sides of the footer',
      story: () => (
        <DialogFooter>
          <Button
            href="#"
            text="Cancel"
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
          />
          <Button
            href="#"
            text="Continue"
            size={Button.ButtonSize.large}
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
            <Button
              href="#"
              text="Cancel"
              size={Button.ButtonSize.large}
              color={Button.ButtonColor.gray}
            />
          </div>
          <div>
            <Button
              href="#"
              text="One Fish"
              size={Button.ButtonSize.large}
            />
            <Button
              href="#"
              text="Two Fish"
              size={Button.ButtonSize.large}
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
