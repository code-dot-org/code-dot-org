module BlocklyHelpers
  Point = Struct.new(:x, :y)

  def drag_block_relative(block_id, dx, dy)
    id_selector = get_id_selector
    @browser.execute_script("$(\"[#{id_selector}='#{block_id}']\").simulate( 'drag', {handle: 'corner', dx: #{dx}, dy: #{dy}, moves: 5});")
  end

  def generate_drag_code(from, to, target_dx, target_dy)
    id_selector = get_id_selector
    generate_selector_drag_code "[#{id_selector}='#{from}']", "[#{id_selector}='#{to}']", target_dx, target_dy
  end

  def generate_selector_drag_code(from, to, target_dx, target_dy)
    "var drag_dx = $(\"#{to}\").offset().left - $(\"#{from}\").offset().left;" \
        "var drag_dy = $(\"#{to}\").offset().top  - $(\"#{from}\").offset().top;" \
        "$(\"#{from}\").simulate( 'drag', {handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def generate_begin_to_drag_code(from, to, target_dx, target_dy)
    id_selector = get_id_selector
    "var drag_dx = $(\"[#{id_selector}='#{to}']\").offset().left - $(\"[#{id_selector}='#{from}']\").offset().left;" \
        "var drag_dy = $(\"[#{id_selector}='#{to}']\").offset().top  - $(\"[#{id_selector}='#{from}']\").offset().top;" \
        "$(\"[#{id_selector}='#{from}']\").simulate( 'drag', {justDrag: true, handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def get_block_coordinates(block_id)
    id_selector = get_id_selector
    # For IE compatability, uses the SVG DOM binding technique from:
    #   http://stackoverflow.com/questions/10349811/how-to-manipulate-translate-transforms-on-a-svg-element-with-javascript-in-chrom
    js = "var xforms = $(\"[#{id_selector}='#{block_id}']\")[0].transform.baseVal; var firstXForm = xforms.getItem(0); if (firstXForm.type == SVGTransform.SVG_TRANSFORM_TRANSLATE){ var firstX = firstXForm.matrix.e; var firstY = firstXForm.matrix.f; }; return [firstX, firstY];"
    coordinate_pair = @browser.execute_script(js)
    Point.new(coordinate_pair[0], coordinate_pair[1])
  end

  # Assign a given string block ID to a given alias
  def add_block_alias(block_alias, block_id)
    if @block_aliases.nil?
      @block_aliases = Hash.new
    end
    @block_aliases[block_alias] = block_id
  end

  # Get the block ID for a given alias
  # Callers expect the returned block ID value to be a string
  def get_block_id(alias_or_id)
    if @block_aliases && @block_aliases.key?(alias_or_id)
      return @block_aliases[alias_or_id]
    end
    alias_or_id
  end

  def get_scrollable_height(block_space_name)
    @browser.execute_script("return Blockly.#{block_space_name}.getScrollableSize(Blockly.modalBlockSpace.getMetrics()).height;")
  end

  def get_block_absolute_left(block_id)
    id_selector = get_id_selector
    @browser.execute_script("return $(\"[#{id_selector}='#{block_id}']\").position().left")
  end

  def get_block_absolute_top(block_id)
    id_selector = get_id_selector
    @browser.execute_script("return $(\"[#{id_selector}='#{block_id}']\").position().top")
  end

  def get_block_workspace_left(block_id)
    @browser.execute_script("return Blockly.mainBlockSpace.getBlockById(#{block_id}).getRelativeToSurfaceXY().x;")
  end

  def get_block_workspace_top(block_id)
    @browser.execute_script("return Blockly.mainBlockSpace.getBlockById(#{block_id}).getRelativeToSurfaceXY().y;")
  end

  def modal_dialog_visible
    @browser.execute_script("return $('#modalContainer').is(':visible');")
  end

  def google_blockly?
    @browser.execute_script("return Blockly.version === 'Google'")
  end

  # Google Blockly encodes the id in the DOM element as the "data-id", CDO Blockly calls it the "block-id"
  def get_id_selector
    google_blockly? ? 'data-id' : 'block-id'
  end
end

World(BlocklyHelpers)
