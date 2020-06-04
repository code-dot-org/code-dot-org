import {expect} from '../../util/deprecatedChai';
import sinon from 'sinon';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import * as dontMarshalApi from '@cdo/apps/applab/dontMarshalApi';

/*
 * These tests verify the behavior of dontMarshalApi.js list APIs when called
 * from native JS (not from within the interpreter)
 *
 * These APIs are called in this fashion when accessed from exported
 * applab projects.
 *
 * The ec_simple integration test has some basic verification for the
 * list APIs when called from the interpreter
 */

describe('insertItem', () => {
  it('inserts an item at the beginning of an empty array', () => {
    const array = [];
    dontMarshalApi.insertItem(array, 0, 'foo');
    expect(array).to.eql(['foo']);
  });

  it('inserts an item at the beginning of an existing array', () => {
    const array = ['bar'];
    dontMarshalApi.insertItem(array, 0, 'foo');
    expect(array).to.eql(['foo', 'bar']);
  });

  it('inserts an item at the end of an existing array', () => {
    const array = ['bar'];
    dontMarshalApi.insertItem(array, array.length, 'foo');
    expect(array).to.eql(['bar', 'foo']);
  });

  it('inserts an item at the end of an existing array when passed a large index', () => {
    const array = ['bar'];
    dontMarshalApi.insertItem(array, 1000, 'foo');
    expect(array).to.eql(['bar', 'foo']);
  });

  it('inserts an item in the middle of an existing array', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.insertItem(array, array.length - 1, 'and');
    expect(array).to.eql(['foo', 'and', 'bar']);
  });

  it('inserts an item right before the last item of an existing array when passed -1', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.insertItem(array, -1, 'and');
    expect(array).to.eql(['foo', 'and', 'bar']);
  });

  it('inserts an item at the beginning of an existing array when passed -array.length', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.insertItem(array, -array.length, 'and');
    expect(array).to.eql(['and', 'foo', 'bar']);
  });

  it('inserts an item at the beginning of an existing array when passed a large negative index', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.insertItem(array, -1000, 'and');
    expect(array).to.eql(['and', 'foo', 'bar']);
  });
});

describe('appendItem', () => {
  it('appends an item at the end of an empty array', () => {
    const array = [];
    dontMarshalApi.appendItem(array, 'foo');
    expect(array).to.eql(['foo']);
  });

  it('appends an item at the end of an existing array', () => {
    const array = ['bar'];
    dontMarshalApi.appendItem(array, 'foo');
    expect(array).to.eql(['bar', 'foo']);
  });
});

describe('removeItem', () => {
  it('removes an item at the end of an existing array', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.removeItem(array, array.length - 1);
    expect(array).to.eql(['foo']);
  });

  it('warns and does nothing when passed a large index', () => {
    const errorHandler = {
      outputWarning: sinon.spy()
    };
    injectErrorHandler(errorHandler);

    const array = ['foo', 'bar'];
    dontMarshalApi.removeItem(array, 1000);
    expect(array).to.eql(['foo', 'bar']);
    expect(errorHandler.outputWarning).to.have.been.calledOnce.and.calledWith(
      'removeItem() index parameter value (1000) is larger than the number of items in the list (2).'
    );
  });

  it('removes an item at the beginning of an existing array', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.removeItem(array, 0);
    expect(array).to.eql(['bar']);
  });

  it('removes an item at the beginning of an existing array when passed a large negative index', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.removeItem(array, -1000);
    expect(array).to.eql(['bar']);
  });

  it('removes an item in the middle of an existing array', () => {
    const array = ['foo', 'and', 'bar'];
    dontMarshalApi.removeItem(array, 1);
    expect(array).to.eql(['foo', 'bar']);
  });

  it('removes the last item of an existing array when passed -1', () => {
    const array = ['foo', 'and', 'bar'];
    dontMarshalApi.removeItem(array, -1);
    expect(array).to.eql(['foo', 'and']);
  });

  it('removes an item at the beginning of an existing array when passed -array.length', () => {
    const array = ['foo', 'bar'];
    dontMarshalApi.removeItem(array, -array.length);
    expect(array).to.eql(['bar']);
  });
});
