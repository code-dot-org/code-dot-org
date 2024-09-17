module BlocklyHelpers
  Point = Struct.new(:x, :y)

  def drag_block_relative(block_id, dx, dy)
    id_selector = get_id_selector
    @browser.execute_script("$(\"[#{id_selector}='#{block_id}']\").simulate( 'drag', {handle: 'corner', dx: #{dx}, dy: #{dy}, moves: 5});")
  end

  def generate_drag_code(from, to, target_dx, target_dy)
    id_selector = get_id_selector
    generate_selector_drag_code "[#{id_selector}='#{from}']:last", "[#{id_selector}='#{to}']", target_dx, target_dy
  end

  def generate_selector_drag_code(from, to, target_dx, target_dy)
    to_offset = generate_offset_code(to)
    from_offset = generate_offset_code(from)
    "var drag_dx = #{to_offset}.left - #{from_offset}.left;" \
        "var drag_dy = #{to_offset}.top  - #{from_offset}.top;" \
        "$(\"#{from}\").simulate( 'drag', {handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def generate_begin_to_drag_code(from, to, target_dx, target_dy)
    id_selector = get_id_selector
    to_offset = generate_offset_code("[#{id_selector}='#{to}']")
    from_offset = generate_offset_code("[#{id_selector}='#{from}']")
    "var drag_dx = #{to_offset}.left - #{from_offset}.left;" \
        "var drag_dy = #{to_offset}.top  - #{from_offset}.top;" \
        "$(\"[#{id_selector}='#{from}']\").simulate( 'drag', {justDrag: true, handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def get_indexed_blockly_draggable_selector(index)
    ".blocklyDraggable:visible:eq(#{index - 1})"
  end

  def drag_indexed_block_to_offset(block_selector, dx, dy)
    target_selector = block_selector # Using the same block as target for relative drag
    code = generate_selector_drag_code(block_selector, target_selector, dx.to_i, dy.to_i)
    @browser.execute_script(code)
  end

  def generate_offset_code(selector)
    # Only get offset for non-hidden elements. We have to check the parent tree
    # for any hidden parents, because blocks will not be "hidden" per jquery's logic
    # if they are inside a hidden div.
    "$(\"#{selector}\").filter(function (index) {" \
        "return $(this).parents(':hidden').length === 0;" \
        "}).offset()"
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
    if @block_aliases&.key?(alias_or_id)
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
end

def google_blockly?
  @browser.execute_script("return Blockly.version === 'Google'")
end

# Google Blockly encodes the id in the DOM element as the "data-id", CDO Blockly calls it the "block-id"
def get_id_selector
  google_blockly? ? 'data-id' : 'block-id'
end

def connect_block(from, to)
  "var workspace = Blockly.getMainWorkspace();" \
  "var blockToMove = workspace.getBlockById('#{from}');" \
  "var targetBlock = workspace.getBlockById('#{to}');" \
  "targetBlock.nextConnection.connect(blockToMove.previousConnection);"
end

def connect_block_statement(from, to)
  "var workspace = Blockly.getMainWorkspace();" \
  "var blockToMove = workspace.getBlockById('#{from}');" \
  "var targetBlock = workspace.getBlockById('#{to}');" \
  "targetBlock.inputList[1].connection.connect(blockToMove.previousConnection);"
end

def delete_block(id)
  "var workspace = Blockly.getMainWorkspace();" \
  "var blockToDelete = workspace.getBlockById('#{id}');" \
  "blockToDelete.dispose();"
end

World(BlocklyHelpers)
