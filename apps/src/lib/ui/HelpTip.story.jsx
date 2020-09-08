import React from 'react';
import HelpTip from './HelpTip';

export default storybook =>
  storybook.storiesOf('HelpTip', module).add('Helptip tooltip', () => (
    <div style={{margin: '2em', maxWidth: 500}}>
      <p>
        The <code>HelpTip</code> component adds a helpful question mark icon
        with an attached tooltip inline with your text.
        <HelpTip>Like this!</HelpTip>
        The tooltip can contain text or arbitrary React content.
        <HelpTip>
          For example, an unordered list:
          <ul>
            <li>Isn't</li>
            <li>That</li>
            <li>Neat?</li>
          </ul>
        </HelpTip>
      </p>
      <p>You use it like this:</p>
      <pre>
        &lt;p&gt;
        <br />
        &nbsp;&nbsp;Here's some text, with a HelpTip on the end of it.
        <br />
        &nbsp;&nbsp;&lt;HelpTip&gt;Here's the tooltip content.&lt;/HelpTip&gt;
        <br />
        &lt;/p&gt;
      </pre>
      <p style={{margin: '1em'}}>
        Here's some text, with a HelpTip on the end of it:
        <HelpTip>Here's the tooltip content.</HelpTip>
      </p>
      <p>
        The tooltip has a maximum width of 400px, so that it wraps nicely when
        given a large amount of text.
        <HelpTip>
          Here's a generic paragraph of text to demonstrate that behavior. Lorem
          ipsum dolor sit amet jedi lightsaber. Darth vader ewok amok
          landspeeder bird feeder cypress citrus listlessness. Lorem ipsum dolor
          sit amet jedi lightsaber. Darth vader ewok amok landspeeder bird
          feeder cypress citrus listlessness.
        </HelpTip>
      </p>
      <p>
        The tooltips also aren't given any direction about where they should
        appear, and they're fairly good at automatically positioning themselves
        in the viewport. So by default, they will appear above the question-mark
        icon, but if you've scrolled and your content is near the top of the
        viewport, they will appear below instead.
      </p>
      <hr />
      <p>
        The original use we had in mind when developing this component was for
        form field labels, to provide additional information about constraints
        on a field, or the effect of a particular option.
      </p>
      <div style={{margin: '1em'}}>
        <label htmlFor="test-password" style={{fontWeight: 'bold'}}>
          Create a new password
          <HelpTip>
            Requirements
            <ul>
              <li>8-30 characters</li>
              <li>Must include both uppercase and lowercase characters</li>
              <li>Must include a number</li>
            </ul>
          </HelpTip>
        </label>
        <input id="test-password" type="password" />
      </div>
      <div style={{margin: '1em'}}>
        <label htmlFor="test-input" style={{fontWeight: 'bold'}}>
          Send email notifications?
          <HelpTip>
            <p>
              Controls whether our system will send the following email
              notifications to attendees of this workshop:
            </p>
            <ul>
              <li>An enrollment receipt</li>
              <li>A ten-day workshop reminder</li>
              <li>A three-day workshop reminder</li>
            </ul>
            <p>
              We will also email a post-workshop survey to attendees, regardless
              of this setting.
            </p>
          </HelpTip>
        </label>
        <select style={{width: '100%'}}>
          <option>Yes, send email on my behalf.</option>
          <option>No, I will manage communications myself.</option>
        </select>
      </div>
    </div>
  ));
