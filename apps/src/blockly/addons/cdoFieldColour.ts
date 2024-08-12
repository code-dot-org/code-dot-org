import {FieldColour, FieldColourConfig, FieldColourValidator} from 'blockly';

export default class CdoFieldColour extends FieldColour {
  // The colours and columns properties are both private in the parent class, so we create
  // additional properties to track the config values.
  private coloursConfig: string[] | null = null;
  private columnsConfig: number = 0;
  static COLOURS: string[] = FieldColour.COLOURS;
  static TITLES: string[] = [];
  static COLUMNS: number = 7;
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
    config?: FieldColourConfig
  ) {
    super(value, validator, config);
    // Duplicates this.colours and this.columns, which are both private in the parent class.
    if (config) {
      if (config.colourOptions) this.coloursConfig = config.colourOptions;
      if (config.columns) this.columnsConfig = config.columns;
    }
  }

  /**
   * Create and show the colour field's editor.
   * Artist modifies blockly.FieldColour.COLOURS and blockly.FieldColour.COLUMNS directly.
   * Therefore, wait to read these values until we need to create the field dropdown.
   * @override
   * */
  protected override showEditor_() {
    this.setColours(this.coloursConfig || CdoFieldColour.COLOURS);
    this.setColumns(this.columnsConfig || CdoFieldColour.COLUMNS);
    super.showEditor_();
  }
}
