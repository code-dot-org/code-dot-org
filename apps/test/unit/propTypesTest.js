import React from 'react';
import {expect} from '../util/deprecatedChai';
var propTypes = require('@cdo/apps/propTypes');

describe('propTypes module', () => {
  function Foo() {}
  function Bar() {}
  function Baz() {}

  describe('whenNoChildOfType prop type', () => {
    var check;
    beforeEach(() => {
      check = ({children, someProp}) =>
        propTypes.whenNoChildOfTypes(Foo)(
          {children, someProp},
          'someProp',
          'SomeComponent'
        );
    });

    describe('does not return an error when', () => {
      it('no children are given', () => {
        expect(check({someProp: 'foo'})).not.to.be.an.instanceOf(Error);
      });

      it('no prop is given', () => {
        expect(check({children: [<Foo />]})).not.to.be.an.instanceOf(Error);
      });
    });

    describe('does return an error when', () => {
      it('both a prop and child are given', () => {
        const error = check({children: [<Foo />], someProp: 'foo'});
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal(
          'SomeComponent was given a someProp prop and a <Foo> child, ' +
            'but only one of those is allowed.'
        );
      });
    });
  });

  describe('childrenOfType prop type', () => {
    var check;
    beforeEach(() => {
      check = (...children) =>
        propTypes.childrenOfType(Foo, Bar)(
          {children},
          'children',
          'SomeComponent'
        );
    });

    describe('does not return an error when', () => {
      it('no children are given', () => {
        expect(check()).not.to.be.an.instanceOf(Error);
      });

      it('only some children are given in the correct order', () => {
        expect(check(<Foo />)).not.to.be.an.instanceOf(Error);
        expect(check(<Bar />)).not.to.be.an.instanceOf(Error);
      });

      it('all children are given in the correct order', () => {
        expect(check(<Foo />, <Bar />)).not.to.be.an.instanceOf(Error);
      });
    });

    describe('does return an error when', () => {
      it('used on a prop other than children', () => {
        check = (...children) =>
          propTypes.childrenOfType(Foo, Bar)(
            {children},
            'nonChildrenProp',
            'SomeComponent'
          );
        expect(check(<Baz />)).to.be.an.instanceOf(Error);
        expect(check(<Baz />).message).to.equal(
          'The childrenOfType prop type should only be used on the children prop.'
        );
      });

      it('children of an invalid type are give', () => {
        expect(check(<Baz />)).to.be.an.instanceOf(Error);
        expect(check(<Baz />).message).to.equal(
          'SomeComponent was given children of types <Baz> ' +
            'but only accepts one of each child in the following order: <Foo>, <Bar>.'
        );
      });

      it('more than one child of the same type are given', () => {
        expect(check(<Bar />, <Bar />)).to.be.an.instanceOf(Error);
        expect(check(<Bar />, <Bar />).message).to.equal(
          'SomeComponent was given children of types <Bar>, <Bar> ' +
            'but only accepts one of each child in the following order: <Foo>, <Bar>.'
        );
      });

      it('children of the correct types are given in the incorrect order', () => {
        expect(check(<Bar />, <Foo />)).to.be.an.instanceOf(Error);
        expect(check(<Bar />, <Foo />).message).to.equal(
          'SomeComponent was given children of types <Bar>, <Foo> ' +
            'but only accepts one of each child in the following order: <Foo>, <Bar>.'
        );
      });
    });
  });
});
