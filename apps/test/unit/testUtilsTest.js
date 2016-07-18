/** @file Who watches the watchers? */
import React from 'react';
import {expect} from '../util/configuredChai';
import {forEveryBooleanPermutation, findChildrenOfType} from '../util/testUtils';

describe('forEveryBooleanPermutation', function () {
  it('invokes a function with no arguments once', function () {
    let invocationCount = 0;
    forEveryBooleanPermutation(() => {
      invocationCount++;
    });
    expect(invocationCount).to.equal(1);
  });

  it('invokes a function with one argument twice, once with true and once with false', function () {
    let expectedInvocations = [
      [false],
      [true]
    ];
    forEveryBooleanPermutation((a) => {
      expect([a]).to.deep.equal(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).to.be.empty();
  });

  it('invokes a function with two arguments four times...', function () {
    let expectedInvocations = [
      [false, false],
      [false, true],
      [true, false],
      [true, true]
    ];
    forEveryBooleanPermutation((a, b) => {
      expect([a, b]).to.deep.equal(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).to.be.empty();
  });

  it('invokes a function with three arguments eight times...', function () {
    let expectedInvocations = [
      [false, false, false],
      [false, false, true],
      [false, true, false],
      [false, true, true],
      [true, false, false],
      [true, false, true],
      [true, true, false],
      [true, true, true]
    ];
    forEveryBooleanPermutation((a, b, c) => {
      expect([a, b, c]).to.deep.equal(expectedInvocations[0]);
      expectedInvocations.shift();
    });
    expect(expectedInvocations).to.be.empty();
  });
});

describe('findChildrenOfType', function () {
  const Foo = () => null;
  const Bar = () => null;

  it('throws when given no first argument', function () {
    expect(() => {
      findChildrenOfType(undefined, 'div');
    }).to.throw(TypeError);
  });

  it('Does not return passed root component', function () {
    const root = (
        <Foo searchTarget>
          <Bar/>
        </Foo>
    );
    const foundChildren = findChildrenOfType(root, Foo);
    expect(foundChildren.length).to.equal(0);
  });

  it('Locates child component', function () {
    const root = (
        <Foo>
          <Bar searchTarget/>
        </Foo>
    );
    const foundChildren = findChildrenOfType(root, Bar);
    expect(foundChildren.length).to.equal(1);
    expect(foundChildren[0].props.searchTarget).to.be.true;
  });

  it('Finds deeply-nested components', function () {
    const root = (
        <Foo>
          <Bar>
            <Foo searchTarget/>
          </Bar>
        </Foo>
    );
    const foundChildren = findChildrenOfType(root, Foo);
    expect(foundChildren.length).to.equal(1);
    expect(foundChildren[0].props.searchTarget).to.be.true;
  });

  it('Finds multiple components', function () {
    const root = (
        <Foo>
          <Bar/>
          <Bar/>
          <Bar/>
        </Foo>
    );
    const foundChildren = findChildrenOfType(root, Bar);
    expect(foundChildren.length).to.equal(3);
  });

  it('Returns components nested at different levels in a flat list', function () {
    const root = (
        <Foo>
          <Bar/>
          <Foo>
            <Bar/>
          </Foo>
          <Foo>
            <Foo>
              <Bar/>
            </Foo>
          </Foo>
        </Foo>
    );
    const foundChildren = findChildrenOfType(root, Bar);
    expect(foundChildren.length).to.equal(3);
    expect(foundChildren.every(child => child.type === Bar)).to.be.true;
  });
});
