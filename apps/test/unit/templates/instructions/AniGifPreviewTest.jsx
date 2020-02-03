import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {ImagePreview} from '@cdo/apps/templates/instructions/AniGifPreview';

describe('ImagePreview', () => {
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
          position: 'relative'
        }}
      >
        <div
          id="ani-gif-preview"
          onClick={onClickCallback}
          style={{
            cursor: 'pointer',
            backgroundImage: "url('example.gif')"
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
          position: 'relative'
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
            backgroundSize: '240px 180px'
          }}
        />
      </div>
    );
  });
});
