import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import CodeWritten from '@cdo/apps/templates/feedback/CodeWritten';

const DEFAULT_PROPS = {
  numLinesWritten: 0,
  totalNumLinesWritten: 0
};

describe('CodeWritten', () => {
  it('renders successfully', () => {
    const wrapper = shallow(<CodeWritten {...DEFAULT_PROPS} />);
    expect(wrapper).to.containMatchingElement(
      <div>
        <p>You just wrote 0 lines of code!</p>
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
        <p>You just wrote 0 lines of code!</p>
        <details>
          <summary>
            <b>Show code</b>
          </summary>
          <code>Some source code I wrote.</code>
        </details>
      </div>
    );
  });

  it('shows total lines of code if nonzero', () => {
    const wrapper = shallow(
      <CodeWritten {...DEFAULT_PROPS} totalNumLinesWritten={1000000} />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <p>You just wrote 0 lines of code!</p>
        <p>All-time total: 1000000 lines of code.</p>
        <details>
          <summary>
            <b>Show code</b>
          </summary>
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
      <CodeWritten
        {...DEFAULT_PROPS}
        totalNumLinesWritten={99}
        useChallengeStyles
      />
    );

    expect(wrapper).to.containMatchingElement(
      <div>
        <p style={{fontSize: 16}}>You just wrote 0 lines of code!</p>
        <p style={{fontSize: 16}}>All-time total: 99 lines of code.</p>
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
              display: 'list-item'
            }}
          >
            <b>Show code</b>
          </summary>
        </details>
      </div>
    );
  });
});
