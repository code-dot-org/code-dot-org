import React from 'react';
import Button from './Button';

export default storybook => {

  storybook
    .storiesOf('Buttons/Button', module)
    .addStoryTable([
      {
        name:'Button Sizes',
        story: () => (
          <div>
            {Object.values(Button.ButtonSize).map((size) => (
              <Button
                size={size}
                text={size}
                href="/foo/bar"
                style={{margin: 2}}
                key={size}
              />
            ))}
          </div>
        )
      },
      {
        name:'Button Colors',
        story: () => (
          <div>
            {Object.values(Button.ButtonColor).map((color) => (
              <Button
                color={color}
                text={color}
                href="/foo/bar"
                style={{margin: 2}}
                key={color}
              />
            ))}
          </div>
        )
      },

      {
        name:'Disabled Buttons',
        story: () => (
          <div>
            {Object.values(Button.ButtonColor).map((color) => (
              <Button
                disabled
                color={color}
                text={color}
                href="/foo/bar"
                style={{margin: 2}}
                key={color}
              />
            ))}
          </div>
        )
      },
      {
        name:'Buttons with Icons',
        story: () => (
          <div>
            {Object.values(Button.ButtonSize).map((size) => (
              <div key={`${size}-row`}>
                {Object.values(Button.ButtonColor).map((color) => (
                  <Button
                    icon="file-text"
                    size={size}
                    color={color}
                    text={color}
                    href="/foo/bar"
                    style={{margin: 2}}
                    key={`${size}-${color}`}
                  />
                ))}
              </div>
            ))}
          </div>
        )
      },
      {
        name:'Button with href',
        story: () => (
          <Button
            href="/foo/bar"
            text="Batman & Robin"
          />
        )
      },
      {
        name:'Button with onClick',
        story: () => (
          <Button
            onClick={() => console.log('click')}
            text="Batman & Robin"
          />
        )
      },
      {
        name:'orange button with styled icon',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.orange}
            icon="caret-down"
            iconStyle={{fontSize: 24, position: 'relative', top: 3}}
            text="Assign Course"
          />
        )
      },
      {
        name: 'pending button',
        story: () => (
          <Button
            href="/foo/bar"
            size={Button.ButtonSize.large}
            text="Continue"
            isPending={true}
            pendingText="Pending..."
          />
        )
      },
    ]);
};
