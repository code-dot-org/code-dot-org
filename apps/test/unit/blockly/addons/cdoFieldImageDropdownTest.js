import {fixMenuGenerator} from '@cdo/apps/blockly/addons/cdoFieldImageDropdown';

describe('CdoFieldImageDropdown', () => {
  it('restructures menu items to make images', () => {
    const options = [
      ['/blockly/media/skins/basketball/hand_1.png', '"hand_1"'],
      ['/blockly/media/skins/basketball/hand_2.png', '"hand_2"'],
      ['/blockly/media/skins/basketball/hand_3.png', '"hand_3"'],
    ];
    const width = 25;
    const height = 50;

    const fixedOptions = fixMenuGenerator(options, width, height);
    expect(fixedOptions).toEqual([
      [
        {
          src: options[0][0],
          width,
          height,
          alt: options[0][1],
        },
        options[0][1],
      ],
      [
        {
          src: options[1][0],
          width,
          height,
          alt: options[1][1],
        },
        options[1][1],
      ],
      [
        {
          src: options[2][0],
          width,
          height,
          alt: options[2][1],
        },
        options[2][1],
      ],
    ]);
  });
});
