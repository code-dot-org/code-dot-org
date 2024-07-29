import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Button from '@cdo/apps/templates/Button';

import style from '@cdo/apps/templates/button.module.scss';

describe('Button', () => {
  it('renders an anchor tag when button has an href', () => {
    const wrapper = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" />
    );

    expect(wrapper.is('a')).toBeTruthy();
    expect(wrapper.props().href).toBe('/foo/bar');
    expect(wrapper.props().target).toBe(undefined);
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

    expect(wrapper.is('a')).toBeTruthy();
    expect(wrapper.props().href).toBe('/foo/bar');
    expect(wrapper.props().target).toBe('_blank');
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

    expect(wrapper.props().rel).not.toBeDefined();

    wrapper.setProps({target: '_blank'});
    expect(wrapper.props().rel).toBe('noopener noreferrer');
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

    expect(wrapper.is('div')).toBeTruthy();
    expect(wrapper.props().href).toBe(undefined);
    expect(wrapper.props().onClick).toEqual(onClick);
    wrapper.simulate('click');
    expect(onClick.calledOnce).toBeTruthy();
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
    expect(!onClick.calledOnce).toBeTruthy();
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
    expect(regular.props().className).toContain(style.default);

    expect(large.props().className).toContain(style.large);
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
    expect(regular.props().className).toContain(style.default);

    expect(narrow.props().className).toContain(style.narrow);
  });

  it('renders smaller if we use a small size', () => {
    const regular = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" />
    );
    const small = shallow(
      <Button
        __useDeprecatedTag
        href="/foo/bar"
        text="Click me"
        size={Button.ButtonSize.small}
      />
    );
    expect(regular.props().className).toContain(style.default);

    expect(small.props().className).toContain(style.small);
  });

  it('renders an orange button by default', () => {
    const wrapper = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" />
    );
    expect(wrapper.props().className).toContain(style.orange);
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
    expect(wrapper.props().className).toContain(style.blue);
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
    expect(wrapper.props().className).toContain(style.purple);
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
    expect(wrapper.props().className).toContain(style.gray);
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
    expect(wrapper.props().className).toContain(style.white);
  });

  it('renders with an icon if specified', () => {
    const wrapper = shallow(
      <Button __useDeprecatedTag href="/foo/bar" text="Click me" icon="lock" />
    );
    const icon = wrapper.find('FontAwesome');
    expect(icon).toBeTruthy();
    expect(icon.props().icon).toEqual('lock');
  });

  it('supports the download property/attribute', () => {
    // The download attribute can be used with or without a value (see
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download),
    // so make sure to test both.
    const wrapper = shallow(
      <Button __useDeprecatedTag download href="/foo/bar" text="Click me" />
    );
    expect(wrapper.find('a').prop('download')).toEqual(true);
    wrapper.setProps({download: 'baz'});
    expect(wrapper.find('a').prop('download')).toEqual('baz');
  });

  it('does not support the download property/attribute for non-anchor tags', () => {
    // <button> and <div> elements do not have a download attribute, so we
    // proactively prevent our component from attempting to use the download
    // property when the underlying element would be one of them.
    expect(() => {
      // button case
      shallow(<Button download text="Click me" />);
    }).toThrow();

    expect(() => {
      // div case
      shallow(<Button __useDeprecatedTag download text="Click me" />);
    }).toThrow();
  });
});
