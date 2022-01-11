import {__testonly__} from '@cdo/apps/sites/studio/pages/scripts/show';
import assert from 'assert';
import sinon from 'sinon';
import queryString from 'query-string';
import * as viewAsRedux from '@cdo/apps/code-studio/viewAsRedux';

describe('scripts/show', function() {
  describe('initViewAs', () => {
    const {initViewAs} = __testonly__;
    let mockStore, mockSetViewType, mockQueryStringParse;
    before(function() {
      mockStore = {
        dispatch: sinon.fake()
      };

      mockSetViewType = sinon.stub(viewAsRedux, 'setViewType');
      mockQueryStringParse = sinon.stub(queryString, 'parse').returns({});
    });

    after(function() {
      mockSetViewType.restore();
      mockQueryStringParse.restore();
    });

    it('defaults to Participant', function() {
      initViewAs(mockStore, null);
      assert(mockSetViewType.calledWith(viewAsRedux.ViewType.Participant));
    });

    // TODO(dmcavoy): Update so it is based on instructor instead of account type
    it('defaults to instructor if current user is a teacher', function() {
      initViewAs(mockStore, 'teacher');
      assert(mockSetViewType.calledWith(viewAsRedux.ViewType.Instructor));
    });

    // TODO(dmcavoy): Update so it is based on participant instead of account type
    it('prevents overriding default if current user is a student', function() {
      mockQueryStringParse.returns({viewAs: viewAsRedux.ViewType.Instructor});
      initViewAs(mockStore, 'student');
      assert(mockSetViewType.calledWith(viewAsRedux.ViewType.Participant));
    });

    // TODO(dmcavoy): Update so it is based on participant instead of account type
    it('allows overriding default if current user is not a student', function() {
      mockQueryStringParse.returns({viewAs: viewAsRedux.ViewType.Instructor});

      initViewAs(mockStore, null);
      assert(mockSetViewType.calledWith(viewAsRedux.ViewType.Instructor));

      initViewAs(mockStore, 'teacher');
      assert(mockSetViewType.calledWith(viewAsRedux.ViewType.Instructor));

      mockQueryStringParse.returns({
        viewAs: viewAsRedux.ViewType.Participant
      });

      initViewAs(mockStore, 'teacher');
      assert(mockSetViewType.calledWith(viewAsRedux.ViewType.Participant));
    });
  });
});
