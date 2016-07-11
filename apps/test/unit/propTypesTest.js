import React from 'react';
import sinon from 'sinon';
import {expect, assert} from '../util/configuredChai';
var propTypes = require('@cdo/apps/propTypes');

describe('propTypes module', () => {

  describe('childrenOfType prop type', () => {
    function Foo(){}
    function Bar(){}
    function Baz(){}
    var check;
    beforeEach(() => {
      check = (...children) => propTypes.childrenOfType(Foo, Bar)(
        {children},
        'children',
        'SomeComponent'
      );
    });

    describe('does not return an error when', () => {

      it('no children are given', () => {
        expect(check()).not.to.be.ok;
      });

      it('only some children are given in the correct order', () => {
        expect(check(<Foo/>)).not.to.be.ok;
        expect(check(<Bar/>)).not.to.be.ok;
      });

      it('all children are given in the correct order', () => {
        expect(check(<Foo/>, <Bar/>)).not.to.be.ok;
      });

    });

    describe('does return an error when', () => {
      it('children of an invalid type are give', () => {
        expect(check(<Baz />)).to.be.an.instanceOf(Error);
        expect(check(<Baz />).message).to.equal(
          'SomeComponent was given children of types <Baz> '+
          'but only accepts one of each child in the following order: <Foo>, <Bar>.'
        );
      });

      it('more than one child of the same type are given', () => {
        expect(check(<Bar />, <Bar />)).to.be.an.instanceOf(Error);
        expect(check(<Bar />, <Bar />).message).to.equal(
          'SomeComponent was given children of types <Bar>, <Bar> '+
          'but only accepts one of each child in the following order: <Foo>, <Bar>.'
        );
      });

      it('children of the correct types are given in the incorrect order', () => {
        expect(check(<Bar />, <Foo />)).to.be.an.instanceOf(Error);
        expect(check(<Bar />, <Foo />).message).to.equal(
          'SomeComponent was given children of types <Bar>, <Foo> '+
          'but only accepts one of each child in the following order: <Foo>, <Bar>.'
        );
      });
    });

  });

});
