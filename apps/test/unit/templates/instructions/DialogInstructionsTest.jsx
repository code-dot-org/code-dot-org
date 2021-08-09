import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedDialogInstructions as DialogInstructions} from '@cdo/apps/templates/instructions/DialogInstructions';
import Instructions from '@cdo/apps/templates/instructions/Instructions';
import msg from '@cdo/locale';

const TEST_PUZZLE_NUMBER = 2;
const TEST_LESSON_TOTAL = 5;
const EXPECTED_PUZZLE_TITLE = msg.puzzleTitle({
  stage_total: TEST_LESSON_TOTAL,
  puzzle_number: TEST_PUZZLE_NUMBER
});
const TEST_INSTRUCTIONS_1 = 'First line of short instructions';
const TEST_INSTRUCTIONS_2 = 'Second line of short instructions';
const SAMPLE_MARKDOWN = `
# Some markdown
- Point one
- Point two
`;
const SAMPLE_IMAGE_URL = 'example.gif';

const DEFAULT_PROPS = {
  puzzleNumber: TEST_PUZZLE_NUMBER,
  lessonTotal: TEST_LESSON_TOTAL,
  shortInstructions: TEST_INSTRUCTIONS_1,
  shortInstructions2: TEST_INSTRUCTIONS_2,
  imgURL: SAMPLE_IMAGE_URL
};

describe('DialogInstructions', () => {
  it('renders instructions and image into Instructions component', () => {
    const wrapper = shallow(<DialogInstructions {...DEFAULT_PROPS} />);
    expect(wrapper).to.containMatchingElement(
      <Instructions
        puzzleTitle={EXPECTED_PUZZLE_TITLE}
        shortInstructions={TEST_INSTRUCTIONS_1}
        instructions2={TEST_INSTRUCTIONS_2}
        longInstructions={undefined}
        imgURL={SAMPLE_IMAGE_URL}
      />
    );
  });

  it('renders long instructions as markdown if provided', () => {
    const wrapper = shallow(
      <DialogInstructions
        {...DEFAULT_PROPS}
        longInstructions={SAMPLE_MARKDOWN}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <Instructions
        puzzleTitle={EXPECTED_PUZZLE_TITLE}
        shortInstructions={TEST_INSTRUCTIONS_1}
        instructions2={TEST_INSTRUCTIONS_2}
        longInstructions={SAMPLE_MARKDOWN}
        imgURL={SAMPLE_IMAGE_URL}
      />
    );
  });

  it('can be configured to only show the image', () => {
    const wrapper = shallow(
      <DialogInstructions
        {...DEFAULT_PROPS}
        longInstructions={SAMPLE_MARKDOWN}
        imgOnly
      />
    );
    expect(wrapper).to.containMatchingElement(
      <Instructions
        puzzleTitle={EXPECTED_PUZZLE_TITLE}
        shortInstructions={undefined}
        instructions2={undefined}
        longInstructions={undefined}
        imgURL={SAMPLE_IMAGE_URL}
      />
    );
  });

  it('can be configured to only show hints', () => {
    const wrapper = shallow(
      <DialogInstructions
        {...DEFAULT_PROPS}
        longInstructions={SAMPLE_MARKDOWN}
        hintsOnly
      />
    );
    expect(wrapper).to.containMatchingElement(
      <Instructions
        puzzleTitle={EXPECTED_PUZZLE_TITLE}
        shortInstructions={undefined}
        instructions2={undefined}
        longInstructions={undefined}
        imgURL={undefined}
      />
    );
  });
});
