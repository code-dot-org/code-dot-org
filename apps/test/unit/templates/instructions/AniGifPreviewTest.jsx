import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ImagePreview} from '@cdo/apps/templates/instructions/AniGifPreview';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('ImagePreview', () => {
  it('contains aria-label when alt prop is present', () => {
    const onClickCallback = () => {};
    const wrapper = shallow(
      <ImagePreview
        url="example.gif"
        alt="this is alt text"
        showInstructionsDialog={onClickCallback}
        noVisualization={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div
        id="ani-gif-preview-wrapper"
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
      >
        <div
          id="ani-gif-preview"
          onClick={onClickCallback}
          style={{
            cursor: 'pointer',
            backgroundImage: "url('example.gif')",
          }}
          role="button"
          tabIndex={0}
          aria-label="this is alt text"
        />
      </div>
    );
  });

  it('contains aria-hidden when alt prop is not present', () => {
    const onClickCallback = () => {};
    const wrapper = shallow(
      <ImagePreview
        url="example.gif"
        showInstructionsDialog={onClickCallback}
        noVisualization={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div
        id="ani-gif-preview-wrapper"
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
      >
        <div
          id="ani-gif-preview"
          onClick={onClickCallback}
          style={{
            cursor: 'pointer',
            backgroundImage: "url('example.gif')",
          }}
          role="button"
          tabIndex={0}
          aria-hidden="true"
        />
      </div>
    );
  });

  it('renders normal size if noVisualization is false', () => {
    const onClickCallback = () => {};
    const wrapper = shallow(
      <ImagePreview
        url="example.gif"
        showInstructionsDialog={onClickCallback}
        noVisualization={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div
        id="ani-gif-preview-wrapper"
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
      >
        <div
          id="ani-gif-preview"
          onClick={onClickCallback}
          style={{
            cursor: 'pointer',
            backgroundImage: "url('example.gif')",
          }}
        />
      </div>
    );
  });

  it('renders large size if noVisualization is true', () => {
    const onClickCallback = () => {};
    const wrapper = shallow(
      <ImagePreview
        url="example2.gif"
        showInstructionsDialog={onClickCallback}
        noVisualization={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div
        id="ani-gif-preview-wrapper"
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
      >
        <div
          id="ani-gif-preview"
          onClick={onClickCallback}
          style={{
            cursor: 'pointer',
            backgroundImage: "url('example2.gif')",
            width: 240,
            height: 180,
            backgroundSize: '240px 180px',
          }}
        />
      </div>
    );
  });
});
