# Testing

We use many different kind of tests to maintain quality in our codebase. Here's an overview of what these tests are, and how to run them.

## Kinds of tests
* Apps directory
  * Mocha Tests 
  * Konacha Tests
* Dashboard directory
  * Ruby tests - All of the server side business logic testing is through here. 
  * UI tests - Used to test overall functionality. Intended to run across browsers.
    * Eyes tests - Subset of UI tests intended to test the precise layout of controls on certain UI pages. Eyes tests are run through Applitools and work by comparing an expected screenshot to an actual screenshot of a certain page. Eyes tests only run on Chrome for now. If you make a change that affects layout, you will likely break eyes tests. Work with whoever is reviewing your PR to figure out if the layout change should be accepted, and the baseline will be adjusted.

## Running tests

### Mocha Tests

### Dashboard Tests

### UI Tests
