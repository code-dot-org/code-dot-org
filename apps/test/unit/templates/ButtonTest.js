import {assert} from '../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import sinon from 'sinon';

describe('Button', () => {
  it('renders an anchor tag when button has an href', () => {
    const wrapper = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" />
    );

    assert(wrapper.is('a'));
    assert.strictEqual(wrapper.props().href, '/foo/bar');
    assert.strictEqual(wrapper.props().target, undefined);
  });

  it('modifies target if provided', () => {
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        target="_blank"
      />
    );

    assert(wrapper.is('a'));
    assert.strictEqual(wrapper.props().href, '/foo/bar');
    assert.strictEqual(wrapper.props().target, '_blank');
  });

  it('attempts to mitigate some of the inherent insecurity when setting target=_blank', () => {
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        target="something other than _blank"
      />
    );

    assert.isUndefined(wrapper.props().rel);

    wrapper.setProps({target: '_blank'});
    assert.strictEqual(wrapper.props().rel, 'noopener noreferrer');
  });

  it('renders a div when button has an onClick', () => {
    const onClick = sinon.spy();
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        onClick={onClick}
        text="Click me"
        target="_blank"
      />
    );

    assert(wrapper.is('div'));
    assert.strictEqual(wrapper.props().href, undefined);
    assert.equal(wrapper.props().onClick, onClick);
    wrapper.simulate('click');
    assert(onClick.calledOnce);
  });

  it('doesnt respond to clicks when disabled', () => {
    const onClick = () => console.log('clicked');
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        onClick={onClick}
        text="Click me"
        target="_blank"
        disabled
      />
    );

    wrapper.simulate('click');
    assert(!onClick.calledOnce);
  });

  it('renders bigger if we use a large size', () => {
    const regular = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" />
    );
    const large = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        size={Button.ButtonSize.large}
      />
    );
    assert.strictEqual(regular.props().style.height, 34);
    assert.strictEqual(regular.props().style.paddingLeft, 24);
    assert.strictEqual(regular.props().style.paddingRight, 24);

    assert.strictEqual(large.props().style.height, 40);
    assert.strictEqual(large.props().style.paddingLeft, 30);
    assert.strictEqual(large.props().style.paddingRight, 30);
  });

  it('renders narrower if we use a narrow size', () => {
    const regular = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" />
    );
    const narrow = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        size={Button.ButtonSize.narrow}
      />
    );
    assert.strictEqual(regular.props().style.height, 34);
    assert.strictEqual(regular.props().style.paddingLeft, 24);
    assert.strictEqual(regular.props().style.paddingRight, 24);

    assert.strictEqual(narrow.props().style.height, 40);
    assert.strictEqual(narrow.props().style.paddingLeft, 10);
    assert.strictEqual(narrow.props().style.paddingRight, 10);
  });

  it('renders an orange button by default', () => {
    const wrapper = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.orange);
  });

  it('renders a blue button if we set color to blue', () => {
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        color={Button.ButtonColor.blue}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.cyan);
  });

  it('renders a purple button if we set color to purple', () => {
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        color={Button.ButtonColor.purple}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.purple);
  });

  it('renders a gray button if we set color to gray', () => {
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        color={Button.ButtonColor.gray}
      />
    );
    assert.strictEqual(
      wrapper.props().style.backgroundColor,
      color.lightest_gray
    );
  });

  it('renders a white button if we set color to white', () => {
    const wrapper = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        color={Button.ButtonColor.white}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.white);
  });

  it('renders with an icon if specified', () => {
    const wrapper = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" icon="lock" />
    );
    const icon = wrapper.find('FontAwesome');
    assert(icon);
    assert.equal(icon.props().icon, 'lock');
  });

  it('supports the download property/attribute', () => {
    // The download attribute can be used with or without a value (see
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download),
    // so make sure to test both.
    const wrapper = shallow(
      <Button __useDeprecatedTag download href="/foo/bar" text="Click me" />
    );
    assert.equal(wrapper.find('a').prop('download'), true);
    wrapper.setProps({download: 'baz'});
    assert.equal(wrapper.find('a').prop('download'), 'baz');
  });

  it('does not support the download property/attribute for non-anchor tags', () => {
    // <button> and <div> elements do not have a download attribute, so we
    // proactively prevent our component from attempting to use the download
    // property when the underlying element would be one of them.
    assert.throws(() => {
      // button case
      shallow(<Button download text="Click me" />);
    });

    assert.throws(() => {
      // div case
      shallow(<Button __useDeprecatedTag download text="Click me" />);
    });
  });
});
