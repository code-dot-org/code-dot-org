import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import color from "@cdo/apps/util/color";

describe('ProgressButton', () => {
  it('renders an anchor tag when button has an href', () => {
    const wrapper = shallow(
      <ProgressButton
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
      <ProgressButton
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
    const onClick = () => console.log('clicked');
    const wrapper = shallow(
      <ProgressButton
        onClick={onClick}
        text="Click me"
        target="_blank"
      />
    );

    assert(wrapper.is('div'));
    assert.strictEqual(wrapper.props().href, undefined);
    assert.equal(wrapper.props().onClick, onClick);
  });

  it('throws if we try to provide an href and an onClick', () => {
    const onClick = () => console.log('clicked');
    assert.throws(() => {
      shallow(
        <ProgressButton
          onClick={onClick}
          href="/foo/bar"
          text="Click me"
          target="_blank"
        />
      );
    });
  });

  it('renders bigger if we use a large size', () => {
    const regular = shallow(
      <ProgressButton
        href="/foo/bar"
        text="Click me"
      />
    );
    const large = shallow(
      <ProgressButton
        href="/foo/bar"
        text="Click me"
        size={ProgressButton.ButtonSize.large}
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
      <ProgressButton
        href="/foo/bar"
        text="Click me"
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.orange);
  });

  it('renders a blue button if we set color to blue', () => {
    const wrapper = shallow(
      <ProgressButton
        href="/foo/bar"
        text="Click me"
        color={ProgressButton.ButtonColor.blue}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.cyan);
  });

  it('renders a gray button if we set color to gray', () => {
    const wrapper = shallow(
      <ProgressButton
        href="/foo/bar"
        text="Click me"
        color={ProgressButton.ButtonColor.gray}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.lightest_gray);
  });

  it('renders a white button if we set color to white', () => {
    const wrapper = shallow(
      <ProgressButton
        href="/foo/bar"
        text="Click me"
        color={ProgressButton.ButtonColor.white}
      />
    );
    assert.strictEqual(wrapper.props().style.backgroundColor, color.white);
  });

  it('renders with an icon if specified', () => {
    const wrapper = shallow(
      <ProgressButton
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
