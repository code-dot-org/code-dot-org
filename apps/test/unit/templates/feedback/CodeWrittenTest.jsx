import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CodeWritten from '@cdo/apps/templates/feedback/CodeWritten';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  numLinesWritten: 0,
};

describe('CodeWritten', () => {
  it('renders successfully', () => {
    const wrapper = shallow(<CodeWritten {...DEFAULT_PROPS} />);
    expect(wrapper).to.containMatchingElement(
      <div>
        <p />
        <details>
          <summary>
            <b>Show code</b>
          </summary>
        </details>
      </div>
    );
  });

  it('renders children inside details tag', () => {
    const wrapper = shallow(
      <CodeWritten {...DEFAULT_PROPS}>
        <code>Some source code I wrote.</code>
      </CodeWritten>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <p />
        <details>
          <summary>
            <b>Show code</b>
          </summary>
          <code>Some source code I wrote.</code>
        </details>
      </div>
    );
  });

  it('Can click "Show code"', () => {
    const wrapper = shallow(<CodeWritten {...DEFAULT_PROPS} />);

    expect(() => {
      wrapper.find('summary').simulate('click');
    }).not.to.throw();

    // Note: This click calls trackEvent but it's already a no-op in unit
    // tests and not currently spyable.
  });

  it('Can render with special challenge styles', () => {
    const wrapper = shallow(
      <CodeWritten {...DEFAULT_PROPS} useChallengeStyles />
    );

    expect(wrapper).to.containMatchingElement(
      <div>
        <p />
        <details style={{textAlign: 'left'}}>
          <summary
            style={{
              fontSize: 14,
              lineHeight: '20px',
              fontWeight: 'normal',
              outline: 'none',
              padding: 5,
              fontColor: 'black',
              marginLeft: 40,
              display: 'list-item',
            }}
          >
            <b>Show code</b>
          </summary>
        </details>
      </div>
    );
  });
});
