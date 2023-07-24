import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../util/reconfiguredChai';
import {
  NavigationBar,
  NavigationCategory,
  NavigationItem,
} from '@cdo/apps/templates/NavigationBar';
import color from '@cdo/apps/util/color';

describe('NavigationItem', () => {
  it('item renders text', () => {
    const wrapper = isolateComponent(
      <NavigationItem text="hello world" href="url" />
    );
    expect(wrapper.content()).to.include('hello world');
    expect(wrapper.findOne('Link').props.href).to.equal('url');
  });

  it('item is indented', () => {
    const wrapper = isolateComponent(
      <NavigationItem text="hello world" href="url" indentLevel={2} />
    );
    expect(wrapper.findOne('.nav-link').props.style.paddingLeft).to.equal(
      '24px'
    );
  });

  it('active item has class for styling', () => {
    let wrapper = isolateComponent(
      <NavigationItem text="hello world" href="url" />
    );
    expect(wrapper.exists('.active')).to.be.false;

    wrapper = isolateComponent(
      <NavigationItem text="hello world" href="url" isActive={true} />
    );
    expect(wrapper.exists('.active')).to.be.true;
  });
});

describe('NavigationCategory', () => {
  it('category renders children', () => {
    const wrapper = isolateComponent(
      <NavigationCategory name="category">
        {['a', 'b', 'c'].map(n => (
          <NavigationItem text={n} href="url" key={n} />
        ))}
      </NavigationCategory>
    );
    expect(wrapper.findAll('NavigationItem').length).to.equal(3);
  });

  it('category opens the initial category', () => {
    let wrapper = isolateComponent(
      <NavigationCategory name="category 1" initialIsOpen={false} />
    );
    expect(wrapper.exists('.open')).to.be.false;

    wrapper = isolateComponent(
      <NavigationCategory name="category 1" initialIsOpen={true} />
    );
    expect(wrapper.exists('.open')).to.be.true;
  });

  it('category changes color', () => {
    let wrapper = isolateComponent(
      <NavigationCategory
        name="category 1"
        color={color.purple}
        initialIsOpen={true}
      />
    );
    expect(wrapper.findOne('.category').props.style.backgroundColor).to.equal(
      color.purple
    );
  });
});

describe('NavigationBar', () => {
  it('nav bar renders children', () => {
    const wrapper = isolateComponent(
      <NavigationBar>
        {['a', 'b', 'c'].map(n => (
          <NavigationCategory name={n} key={n}>
            {n}
          </NavigationCategory>
        ))}
      </NavigationBar>
    );
    expect(wrapper.findAll('NavigationCategory').length).to.equal(3);
  });
});
