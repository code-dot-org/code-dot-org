import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

describe('ProgressLevelSet', function () {
  describe('getIcon', () => {
    it('strips fa- from level.icon if one is provided', () => {
      const wrapper = shallow(
        <ProgressLevelSet
          start={1}
          levels={[{
            status: LevelStatus.not_tried,
            url: '/foo',
            icon: 'fa-file-text'
          }]}
        />
      );
      assert.equal(wrapper.instance().getIcon(), 'file-text');
    });

    it('uses desktop icon if no icon on level', () => {
      const wrapper = shallow(
        <ProgressLevelSet
          start={1}
          levels={[{
            status: LevelStatus.not_tried,
            url: '/foo',
            icon: null
          }]}
        />
      );
      assert.equal(wrapper.instance().getIcon(), 'desktop');
    });

    it('throws if icon is invalid', () => {
      assert.throws(function () {
        const wrapper = shallow(
          <ProgressLevelSet
            start={1}
            levels={[{
              status: LevelStatus.not_tried,
              url: '/foo',
              icon: 'file-text'
            }]}
          />
        );
      }, /Unknown iconType: /);
    });
  });
});
