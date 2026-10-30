import Typography from '@mui/material/Typography';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('GeneratedCode', () => {
  const wrapper = shallow(
    <GeneratedCode message="Test message" code="Test code" />
  );

  it('renders code explicitly in ltr', () => {
    expect(wrapper).to.containMatchingElement(<pre dir="ltr">Test code</pre>);
  });

  it('renders message inside a Typography element', () => {
    expect(wrapper).to.containMatchingElement(
      <Typography variant="body3" component="p">
        Test message
      </Typography>
    );
  });
});
