import React from 'react';
import _ from 'lodash';
import {shallow} from 'enzyme';
import ModuleAssignment from '@cdo/apps/code-studio/pd/professional_learning_landing/plcElements/moduleAssignment';
import {expect} from 'chai';

describe ("Module assignment element", () => {
  it("colors are as expected for module assignment", () => {
    _.forEach({not_started: 'white', in_progress: '#efcd1c', completed: '#0EBE0E'}, (value, key) => {
      const moduleAssignment = shallow(
        <ModuleAssignment
          moduleAssignmentData={{
            category: 'Overview',
            status: key
          }}
        />
      );

      expect(moduleAssignment.find('div').last().props().style.backgroundColor).to.equal(value);
    });
  });
});
