import { assert } from '../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import Button from '@cdo/apps/templates/Button';
import color from "@cdo/apps/util/color";
import sinon from 'sinon';

describe('Button', () => {
  it('renders an anchor tag when button has an href', () => {
    const wrapper = shallow(
      <Button
        href="/foo/bar"
        text="Click me"
      />
    );

    assert(wrapper.is('a'));
    assert.strictEqual(wrapper.props().href, "/foo/bar");
    assert.strictEqual(wrapper.props().target, undefined);
  });

  it('modifies target if provided', () => {
    const wrapper = shallow(
      <Button
        href="/foo/bar"
        text="Click me"
        target="_blank"
      />
    );

    assert(wrapper.is('a'));
    assert.strictEqual(wrapper.props().href, "/foo/bar");
    assert.strictEqual(wrapper.props().target, "_blank");
  });

  it('renders a div when button has an onClick', () => {
    const onClick = sinon.spy();
    const wrapper = shallow(
      <Button
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
      <Button
        href="/foo/bar"
        text="Click me"
      />
    );
    const large = shallow(
      <Button
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

  it('renders an orange button by default', () => {
    const wrapper = shallow(
      <Button
        href="/foo/bar"
        text="Click me"
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.orange);
  });

  it('renders a blue button if we set color to blue', () => {
    const wrapper = shallow(
      <Button
        href="/foo/bar"
        text="Click me"
        color={Button.ButtonColor.blue}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.cyan);
  });

  it('renders a gray button if we set color to gray', () => {
    const wrapper = shallow(
      <Button
        href="/foo/bar"
        text="Click me"
        color={Button.ButtonColor.gray}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.lightest_gray);
  });

  it('renders a white button if we set color to white', () => {
    const wrapper = shallow(
      <Button
        href="/foo/bar"
        text="Click me"
        color={Button.ButtonColor.white}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.white);
  });

  it('renders with an icon if specified', () => {
    const wrapper = shallow(
      <Button
        href="/foo/bar"
        text="Click me"
        icon="lock"
      />
    );
    const icon = wrapper.find('FontAwesome');
    assert(icon);
    assert.equal(icon.props().icon, 'lock');
  });
});
