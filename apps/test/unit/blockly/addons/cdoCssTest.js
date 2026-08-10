import initializeCss from '@cdo/apps/blockly/addons/cdoCss';

// initializeCss registers once per module load, so collect the css once.
let registered = '';
initializeCss({
  Css: {
    register: css => {
      registered += css;
    },
  },
});

describe('cdoCss', () => {
  // !important here would beat the inline colour fields set via
  // DropDownDiv.setColour(), hiding white arrow images on a white panel.
  it('leaves the drop-down panel colours overridable', () => {
    const rule = registered.match(/\n\s*\.blocklyDropDownDiv \{([^}]*)\}/);
    expect(rule).not.toBeNull();
    expect(rule[1]).toContain('background-color');
    expect(rule[1]).not.toContain('!important');
  });
});
