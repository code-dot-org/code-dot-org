import {FieldColour, FieldColourConfig, FieldColourValidator} from 'blockly';

export default class CdoFieldColour extends FieldColour {
  // The colours and columns properties are both private in the parent class, so we create
  // additional properties to track the config values.
  private coloursConfig: string[] | null = null;
  private columnsConfig: number = 0;
  static COLOURS: string[] = FieldColour.COLOURS;
  static TITLES: string[] = [];
  static COLUMNS: number = 7;
  static K1_FIELD_SIZE = {height: 35, width: 45};
  private isK1: boolean;
  /**
   * @param value The initial value of the field.  Should be in '#rrggbb'
   *     format.  Defaults to the first value in the default colour array.  Also
   *     accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param validator A function that is called to validate changes to the
   *     field's value.  Takes in a colour string & returns a validated colour
   *     string ('#rrggbb' format), or null to abort the change.
   * @param config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/colour}
   * for a list of properties this parameter supports.
   */
  constructor(
    value?: string | typeof Blockly.Field.SKIP_SETUP,
    validator?: FieldColourValidator,
    config?: FieldColourConfig,
    isK1?: boolean
  ) {
    super(value, validator, config);
    // Duplicates this.colours and this.columns, which are both private in the parent class.
    if (config) {
      if (config.colourOptions) this.coloursConfig = config.colourOptions;
      if (config.columns) this.columnsConfig = config.columns;
    }
    this.isK1 = !!isK1;
  }

  /**
   * Create and show the colour field's editor.
   * Artist modifies blockly.FieldColour.COLOURS and blockly.FieldColour.COLUMNS directly.
   * Therefore, wait to read these values until we need to create the field dropdown.
   * For pre-reader blocks (CSF Course A-B, Course 1 and Pre-Reader Express), we add a
   * class to manually increase the size of the field.
   * @override
   * */
  protected override showEditor_() {
    this.setColours(this.coloursConfig || CdoFieldColour.COLOURS);
    this.setColumns(this.columnsConfig || CdoFieldColour.COLUMNS);
    super.showEditor_();
    if (this.isK1) {
      // @ts-expect-error: Accessing private member 'picker'
      Blockly.utils.dom.addClass(this.picker, 'k1ColourDropdown');
    }
  }

  /**
   * This override allows resizing of the colour options to align with conventions used
   * in our pre-reader blocks.
   * The base class version updates the size of the field based on whether it is a full
   * block fieldor not.
   *
   * @param margin margin to use when positioning the field.
   */
  protected updateSize_(margin?: number) {
    super.updateSize_(margin);

    if (this.isK1) {
      this.size_ = CdoFieldColour.K1_FIELD_SIZE;
    }

    this.positionBorderRect_();
  }
}
