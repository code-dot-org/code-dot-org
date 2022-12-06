module GoogleBlocklyHelpers
  Point = Struct.new(:x, :y)

  def google_blockly?
    @browser.execute_script("return Blockly.version === 'Google'")
  end

  # Google Blockly encodes the id in the DOM element as the "data-id", CDO Blockly calls it the "block-id"
  def get_id_selector
    google_blockly? ? 'data-id' : 'block-id'
  end

  def generate_google_blockly_block_drag_code(target_index, destination_index, target_dx, target_dy)
    "var drag_dx = $(\"[class='blocklyDraggable']\").eq(#{destination_index.to_i}).offset().left - $(\"[class='blocklyDraggable']\").eq(#{target_index.to_i}).offset().left;" \
        "var drag_dy = $(\"[class='blocklyDraggable']\").eq(#{destination_index.to_i}).offset().top  - $(\"[class='blocklyDraggable']\").eq(#{target_index.to_i}).offset().top;" \
        "$(\"[class='blocklyDraggable']\").eq(#{target_index.to_i}).simulate( 'drag', {handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def get_google_blockly_block_coordinates(block_index)
    # For IE compatability, uses the SVG DOM binding technique from:
    #   http://stackoverflow.com/questions/10349811/how-to-manipulate-translate-transforms-on-a-svg-element-with-javascript-in-chrom
    js = "var xforms = $(\"[class='blocklyDraggable']\").eq(#{block_index.to_i})[0].transform.baseVal; var firstXForm = xforms.getItem(0); if (firstXForm.type == SVGTransform.SVG_TRANSFORM_TRANSLATE){ var firstX = firstXForm.matrix.e; var firstY = firstXForm.matrix.f; }; return [firstX, firstY];"
    coordinate_pair = @browser.execute_script(js)
    Point.new(coordinate_pair[0], coordinate_pair[1])
  end
end

World(GoogleBlocklyHelpers)
