import * as storybook from '@kadira/storybook';
import React from 'react';

const styles = {
  about: {
    padding: 50
  }
};

storybook
  .storiesOf('About', module)
  .add('Intro', () => (
    <div style={styles.about}>
      <h1>About</h1>
      <p>
        <code>react-storybook</code> is a library/tool for organizing examples of all
        the different react components in your application. You can use it to:
      </p>
      <ul>
        <li>Look for existing components that you might reuse for a new feature</li>
        <li>Develop a new component without having to run the full application</li>
        <li>Show a PM or designer how a component looks before having to hook it up "for real"</li>
        <li>Document anything using some javascript and html</li>
      </ul>
      <h1>When to create new stories</h1>
      <p>
        tl;dr: whenever you want!
      </p>
      <p>
        This storybook can contain any and
        all components in the application, whether or not they are intended
        for broad reuse. If you think your component will get reused a lot by many
        different people, then it is a really good idea to add some examples for it
        to this story book!
      </p>
      <h1>Your new workflow</h1>
      <p>
        In practice, this is how your workflow might look when using
        this tool to develop a new component:
      </p>
      <ol>
        <li>
          Create an empty react component. For example in <strong>MyComponent.jsx</strong>:
          <pre>{`export function MyComponent() {
  return <div>MyComponent</div>;
}`}</pre>
        </li>
        <li>
          Add a story file named <strong>MyComponent.story.jsx</strong> for
          this component with a single example:
          <pre>{`export default storybook => {
  storybook
    .storiesOf('MyComponent', module)
    .addWithInfo(
      'default props',
      'This is how MyComponent will look with the default props',
      () => <MyComponent/>
    );
};`}</pre>
        </li>
        <li>
          Browse to the story for this component in the left-hand bar
        </li>
        <li>
          Start editing the source code for the component to make it look the way you want.
          It will automatically update in the browser every time you save using the
          react hot loader.
        </li>
        <li>
          When you are ready to add prop-based customization to your component,
          add another story with an example of what the different props might look
          like. For example:
          <pre>{`storybook => {
  storybook
    .storiesOf('MyComponent', module)
    .addWithInfo(
      'default props',
      'This is how MyComponent will look with the default props',
      () => <MyComponent/>
    )
    .addWithInfo(
      'default props',
      'This is how MyComponent will look with the awesome=true',
      () => <MyComponent awesome={true}/>
    );
};`}</pre>
        </li>
        <li>
          Keep doing this until you've programmed all the different important states
          of your component.
        </li>
        <li>Show off to your PM/designer</li>
        <li>...</li>
        <li>Profit!</li>
      </ol>
      <h1>Caveats</h1>
      <p>
        This system works particularly well for stateless components that don't
        depend on globals. However, it does not work very well for components that have lots
        of internal state, since you can't feed that internal state into the examples
        you create.
      </p>
      <p>
        When creating complex UI components that seem like they need a lot of state,
        consider using redux to manage the state instead, and pass what is needed
        into the component via props.
      </p>
      <h1>Documenting Other Things</h1>
      <p>
        You can use stories to document more than just individual UI components.
        A story is really just a function with some descriptive text that returns
        some react elements. For example, this about page is just a function that
        returns some react-rendered html. You can add anything to this story book
        that can be rendered to html with javascript.
      </p>
      <h1>Storybook Addons</h1>
      <p>
        There are a number of different ways that your stories can be rendered in
        this styleguide, depending on the function you use to add them. Here are
        the options:
      </p>
      <ul>
        <li>
          <code>storybook.add(name: string, story: Function)</code>
          - this is react-storybook's standard method for
          adding stories. It will just stick the component you render in the middle
          of the screen.
        </li>
        <li>
          <code>storybook.addWithInfo(name: string, description: string, story: Function)</code>
          - this function renders lots of information about the component behind a
          little "?" icon in the top right corner.
        </li>
        <li>
          <code>
            {'storybook.addStoryTable(examples:Array<{name: string, description: string, story:Function}>)'}
          </code>
          - this function renders a table with many different examples in an "Overview"
          section on the left-hand bar. It will also add each item to the left-hand bar
          using the normal add() method.
        </li>
      </ul>
      <h1>Marking Components as Deprecated</h1>
      <p>
        To mark a component as deprecated, use the <code>deprecatedStoriesOf()</code>
        function instead of <code>storiesOf()</code>. The <code>deprecatedStoriesOf()</code>
        function takes an optional third argument, which an object with additional information
        about the deprecation. For example:
        <pre>{`storybook.deprecatedStoriesOf('SomeComponent', module, {
  reason: 'SomeComponent was really old and crufty, and someone built the new hotness.'
  replacement: "NewHotness"
})`}</pre>
      </p>
      <p>
        This will automatically create a new deprecated story for
        the component that contains a link to the stories for "NewHotness"
      </p>
      <h1>Publishing The Storybook</h1>
      This storybook is automatically published to <a href="https://code-dot-org.github.io/cdo-styleguide/">https://code-dot-org.github.io/cdo-styleguide/</a> when staging is built. So just check your changes into staging, and they will be published online shortly!
      <h1>Links</h1>
      <ul>
        <li>
          <a href="https://github.com/kadirahq/react-storybook">
            react-storybook documentation
          </a>
        </li>
      </ul>
    </div>
  ));
