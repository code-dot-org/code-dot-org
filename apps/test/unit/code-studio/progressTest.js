/** @file Test of progress.js. */

import queryString from 'query-string';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {initViewAs} from '@cdo/apps/code-studio/progress';
import {__testonly__} from '@cdo/apps/code-studio/progressReduxSelectors';
import * as viewAsRedux from '@cdo/apps/code-studio/viewAsRedux';

describe('bestResultLevelId', function () {
  var progressData;
  const bestResultLevelId = __testonly__.bestResultLevelId;

  beforeAll(function () {
    progressData = {
      1: 0,
      2: 0,
      3: -50,
      4: 20,
      5: 100,
      6: 0,
      7: 100,
    };
  });
  it("returns the level when there's only one", function () {
    expect(bestResultLevelId([1], progressData)).toBe(1);
  });
  it('returns the first level when none have progress', function () {
    expect(bestResultLevelId([1, 2], progressData)).toBe(1);
  });
  it('returns the passed level', function () {
    expect(bestResultLevelId([1, 4], progressData)).toBe(4);
  });
  it('returns the unsubmitted level', function () {
    expect(bestResultLevelId([1, 3], progressData)).toBe(3);
  });
  it('returns the perfect level over the passed level', function () {
    expect(bestResultLevelId([4, 5], progressData)).toBe(5);
  });
});

describe('initViewAs', function () {
  let mockStore, mockSetViewType, mockQueryStringParse;
  beforeAll(function () {
    mockStore = {
      dispatch: sinon.fake(),
    };

    mockSetViewType = sinon.stub(viewAsRedux, 'setViewType');
    mockQueryStringParse = sinon.stub(queryString, 'parse').returns({});
  });

  afterAll(function () {
    mockSetViewType.restore();
    mockQueryStringParse.restore();
  });

  it('defaults to Participant', function () {
    initViewAs(mockStore, null);
    expect(
      mockSetViewType.calledWith(viewAsRedux.ViewType.Participant)
    ).toBeTruthy();
  });

  it('defaults to instructor if current user is instructor for course', function () {
    initViewAs(mockStore, true, true);
    expect(
      mockSetViewType.calledWith(viewAsRedux.ViewType.Instructor)
    ).toBeTruthy();
  });

  it('prevents overriding default if current user is not an instructor', function () {
    mockQueryStringParse.returns({viewAs: viewAsRedux.ViewType.Instructor});
    initViewAs(mockStore, true, false);
    expect(
      mockSetViewType.calledWith(viewAsRedux.ViewType.Participant)
    ).toBeTruthy();
  });

  it('allows overriding default if current user is not a student', function () {
    mockQueryStringParse.returns({viewAs: viewAsRedux.ViewType.Instructor});

    initViewAs(mockStore, null, false);
    expect(
      mockSetViewType.calledWith(viewAsRedux.ViewType.Instructor)
    ).toBeTruthy();

    initViewAs(mockStore, true, true);
    expect(
      mockSetViewType.calledWith(viewAsRedux.ViewType.Instructor)
    ).toBeTruthy();

    mockQueryStringParse.returns({viewAs: viewAsRedux.ViewType.Participant});

    initViewAs(mockStore, true, true);
    expect(
      mockSetViewType.calledWith(viewAsRedux.ViewType.Participant)
    ).toBeTruthy();
  });
});
