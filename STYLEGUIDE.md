# Style Guide

## Prelude
We try to maintain a consistent style for two reasons:
- It makes it easier for any dev to jump into any part of the codebase.
- Following the guide can help avoid common mistakes and language gotchas.

Set up your editor to do the heavy lifting. If your editor is capable, configure it to align with the standards listed below. This makes mistakenly introducing style errors less likely.

Some lint and style rules are enforced by [Rubocop](https://github.com/bbatsov/rubocop). You can check your changes locally by running `rake lint`. Hound CI will also comment on issues it sees in Pull Requests.

## All Languages
- Be consistent with surrounding code. When working in a new file, take a bit of time to get a feel for the style. The intent is to keep the code readable and not interrupt the flow.
  - If there are conflicting styles in the surrounding code, go with the one closest to the standards listed below.
  - When possible, clean up the less preferred style when it's simple to do so.
  -If it's a quick clean-up, modify the file to align with standards.
- Prefer helpers from already-included libraries—i.e., do a quick search to make sure you're not reinventing a wheel. Lodash, Google Closure tools, and standard Ruby libraries often have well-tested helpers for common operations.
- Prefer extracting descriptively-named methods and variables over introducing redundant comments.
- Remove anything Git's diff view complains about: No trailing whitespace at the ends of lines, single newline at end of document. Configure your editor to do this automatically.
- Stick to an 80 character line length when possible, except for long URLs in comments or long regular expressions. Occasionally wiggling between 80 and 120 characters is OK in cases where it greatly improves the readability over a multiple line split.
- Space after comment start. `// Use capitalization and punctuation in comments.`

## Ruby
Default: https://github.com/bbatsov/ruby-style-guide

Fallback: https://github.com/styleguide/ruby

* Use [YARD](http://www.rubydoc.info/gems/yard/file/docs/GettingStarted.md) (jsdoc style @tag annotations) when documenting parameter types and return values.   http://www.rubydoc.info/gems/yard/file/docs/GettingStarted.md

* <a name="ruby-hashes"></a>
  Prefer Ruby 1.9 hash syntax.
  <sup>[[link](#ruby-hashes)]</sup>
  ```ruby
  # bad
  {:a => 1}

  # good
  {a: 1}
  ```

* <a name="ruby-string-quotes"></a>
  Prefer single quotes for non-interpolated strings.
  <sup>[[link](#ruby-string-quotes)]</sup>
  ```ruby
  # bad
  "Double-quoted string without interpolation"

  # good
  'Single quotes for normal strings'
  ```

* <a name="ruby-trailing-dot"></a>
  When breaking lines while method chaining, prefer trailing dot on first line
  to leading dot on second line.
  <sup>[[link](#ruby-trailing-dot)]</sup>
  ```ruby
  # bad
  my_object
    .first_method
    .second_method

  # good
  my_object.
    first_method.
    second_method
  ```

### Rails

Prefer skinny controllers.  Leverage the framework where possible and write as little custom code as possible to implement the feature.  Guidelines here are not set in stone: when in doubt prefer readable code over strict adherence to the style guide.

Default: https://github.com/bbatsov/rails-style-guide

Fallback: https://github.com/thoughtbot/guides/tree/master/style/rails

Fallback: http://matthewpaulmoore.com/post/5190436725/ruby-on-rails-code-quality-checklist

* <a name="rails-instance-variables"></a>
  Helpers shouldn't set instance variables. Prefer directly returning a value from the helper.
  <sup>[[link](#rails-instance-variables)]</sup>

## JavaScript

Default: http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml

* <a name="js-indentation"></a>
  Use 2 spaces per indentation level. Line continuations should be indented at 4 spaces (including function arguments). Wrap at 80 characters.
  <sup>[[link](#js-indentation)]</sup>
  ```javascript
  StudioApps.prototype.reallyLongFunctionName = function (argument1,
      argument2, argument3) {
    // ...
  };
  ```

* <a name="js-block-braces"></a>
  Always use braces for blocks.
  <sup>[[link](#js-block-braces)]</sup>
  ```javascript
  // bad
  if (test) return true;

  // good
  if (test) {
    return true;
  }
  ```

* <a name="js-parentheses-spacing"></a>
  Parentheses adjacent to name, but not to a keyword.
  <sup>[[link](#js-parentheses-spacing)]</sup>
  ```javascript
  function () { ... }
  function test() { ... }
  while (n < 1) { ... }
  ```

* <a name="js-ambiguous-this"></a>
  Avoid `this` in functions where callers might not bind the correct scope. Generally this means not using `this` in static methods and bare functions.
  <sup>[[link](#js-parentheses-spacing)]</sup>

* <a name="js-native-array-functions"></a>
  Prefer IE9-compatible native JavaScript collection operators (such as `.forEach`, `.map`, `.filter`) over library equivalents.
  <sup>[[link](#js-native-array-functions)]</sup>

* <a name="js-event-handlers"></a>
  Separate event handlers from markup.
  <sup>[[link](#js-event-handlers)]</sup>
  ```haml
  -# bad
  .header_popup{onclick: '/* do something... */'}

  -# good
  .header_popup
  :javascript
  $('.header_popup').click(function () {
    /* do something... */
  });
  ```

* <a name="js-operator-continuations"></a>
  Binary and Ternary line continuations should have the operator at the beginning of the line (note this is different from Google's JavaScript style guide).
  <sup>[[link](#js-operator-continuations)]</sup>
  ```javascript
  // bad
  myObject.
      doSomething().
      doSomethingElse();

  // good
  myObject.doSomething()
      .doSomethingElse();
  ```
  
* <a name="js-module-exports"></a>
  We have a few different patterns for how we export things in our JS files currently. There's not necessarily
  an expectation that we'll go fix these all, but new code should try to follow these patterns.
  <sup>[[link](#js-module-exports)]</sup>
  ```javascript
  // good
  module.exports.foo = function foo() { }
  // elsewhere
  foo();
  
  // okay, unless you're calling this method locally
  module.exports.foo = function () {
  }
  // elsewhere - bad
  module.exports.foo();
  
  // good
  var Foo = module.exports = function () {
  };
  Foo.prototype.bar = function () {
  }
  
  // good
  // React is a bit of a special case, in that var Foo = module.exports = React.createClass({
  // results in React devtools thinking our component is named exports instead of Foo. As such,
  // we prefer a slightly different pattern in this context.
  var Foo = React.createClass({
  ...
  });
  module.exports = Foo;
  
  
  // bad
  module.exports = {
    foo: function () {
    }
  }
  
  // bad
  function foo() {
  }
  module.exports = {
    foo: foo
  }
  ```

* <a name="js-avoid-inlinejs"></a>
  Avoid inline Javacript in HAML and ERB views. Inline Javascript is
  hard to lint, test, and reuse, and tends to build in lots of global
  interdependencies between code and views.

  Here are some hints and guidelines.

  - New JS code in our Rails apps should go in a .js file, not inline in
  the view; this will be enforced by code review.

  - If you modify inline JS code in a template, please move it out
    of the file as part of the same CL.  (Exceptions can be granted
    on a case by case basis.)

  - Server-side configuration information that needs to be shared
    with Javascript code should be put in `app_options`. Our
    templates include a script tag which assigns app_options to
    a Javascript variable so that it as accessible from JS.

### React
Our default style if not mentioned here should be that mentioned in the AirBnb guide https://github.com/airbnb/javascript/tree/master/react (perhaps with the exception of closing tags on their own line).
* <a name="js-react-inline-styles"></a>
Prefer single object for all styles vs. inlined style objects.  Define static styles outside the component, and only dynamic styles in the render method.
```jsx
// Bad
var component = (
  <div style={{color: 'red', display: 'block'}}>
    <div style={{color: 'blue', fontSize: 10}}>I'm a child</div>
  </div>
);

// Good
var styles = {
  root: {
    color: 'red',
    display: 'block
  },
  child: {
    color: 'blue',
    fontSize: 10
  }
};
...
var component = (
  <div style={styles.root}>
    <div style={styles.child}>I'm a child</div>
  </div>
);

// Example of defining static and dynamic styles separately
var staticStyles = {
  root: {
    display: 'block'
  },
  child: {
    color: 'blue',
    fontSize: 10
  }
};
var Component = function (props) {
  var styles = _.merge({}, staticStyles, {
    root: {
      color: this.props.color
    }
  });
  return (
    <div style={styles.root}>
      <div style={styles.child}>I'm a child</div>
    </div>
  );
};
```
* <a name="js-react-pixel-numbers"></a>
Prefer numbers vs strings for pixel values
```jsx
// Bad
var styles = {
  root: {
    width: '100px',
    height: '100px'
  }
}'

// Good
var styles = {
  root: {
    width: 100,
    height: 100
  }
};
```
* <a name="js-react-long-components"></a>
Components with many attributes should have one per line, with 4 spaces of indentation. Child components should have 2 spaces of indentation.
```jsx
// Bad
var component = (
  <MyComponent param1={1} param2={2} param3={3} param4={4} param5={5}>
    <ChildComponent/>
  </MyComponent>
);

// Good
var component = (
  <MyComponent
      param1={1}
      param2={2}
      param3={3}
      param4={4}
      param5={5}>
    <ChildComponent/>
  </MyComponent>
);
```
* <a name="jsx-child-elements-on-own-line"></a>
Since JSX [removes newlines before rendering to HTML](http://andrewhfarmer.com/how-whitespace-works-in-jsx/)
you can and should put child elements on their own line, instead of putting
them on the same line to avoid extra spaces.

```
// good
<Component
    prop1="prop1"
    prop2="prop2">
  textContent
</Component>


// bad
<Component
    prop1="prop1"
    prop2="prop2">textContent</Component>
    
// good - fine to put content on same line if the tag opens & closes on that line
<Component>textContent</Component>
```

* <a name="js-react-aligned-tags"></a>
align open and close tags
```jsx
// Bad
var component = (<MyComponent
      foo="bar"
      onClose={this.handleClose}>
    <ChildComponent/>
  </MyComponent>);

// Good
var component = (
  <MyComponent
      foo="bar"
      onClose={this.handleClose}>
    <ChildComponent/>
  </MyComponent>
);
```


### In /apps

Use lodash and jQuery libraries in `/apps`.

### In /blockly-core

Use Google Closure Tools in `/blockly-core`, especially for color conversion and keyboard identifiers. Prefer raw HTML over Closure Tools UI constructs for new code.

## CSS

Default: https://github.com/thoughtbot/guides/tree/master/style/sass

Fallback: https://css-tricks.com/sass-style-guide

Fallback: http://css-tricks.com/css-style-guides

- Avoid inline styles in markup.
- Use names that are as short as possible but as long as necessary.
- Use SCSS helpers for vendor prefixing.
- Extract colors into named, re-used variables.
- Extract magic numbers into named variables.
- Use ID selectors only when there is, and only ever will be, one item on a page.
- Nest selectors a maximum of three levels deep.
- Use dashes instead of underscores, camel casing, etc for separating words in IDs, classes, mixins and filenames.
- Prefix scss partials with _, e.g., _header.scss.
- Use alphabetical order for new declarations in already-alphabetically-ordered files. Place `@extends` and `@includes` at the top of lists.

## HTML

Default: http://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml

- Avoid inline event handlers in markup.
- Avoid inline styles in markup.
- Prefer double quotes for attributes.
- Use dashes instead of underscores, camel casing, etc for separating words in IDs and classes.

