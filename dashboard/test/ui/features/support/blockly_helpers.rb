module BlocklyHelpers
  Point = Struct.new(:x, :y)

  def drag_block_relative(block_id, dx, dy)
    id_selector = get_id_selector
    drag_indexed_block_to_offset("[#{id_selector}='#{block_id}']", dx, dy)
  end

  def generate_drag_code(from, to, target_dx, target_dy)
    id_selector = get_id_selector
    from_selector = "[#{id_selector}='#{from}']:last"
    to_selector = ".blocklySvg [#{id_selector}='#{to}']"
    # Blockly 13 uses pointer events; return JS that fires them directly.
    # pointerdown on the from element, pointermove/pointerup on document.
    <<~JS
      (function() {
        var filter = function() { return $(this).parents(':hidden').length === 0; };
        var fromEl = $("#{from_selector}").filter(filter)[0];
        var toEl = $("#{to_selector}").filter(filter)[0];
        if (!fromEl || !toEl) return;
        var fromRect = fromEl.getBoundingClientRect();
        var toRect = toEl.getBoundingClientRect();
        var startX = fromRect.left + fromRect.width / 2;
        var startY = fromRect.top + fromRect.height / 2;
        var endX = toRect.left + #{target_dx.to_i};
        var endY = toRect.top + #{target_dy.to_i};
        var moves = 8;
        fromEl.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true, cancelable: true,
          clientX: startX, clientY: startY,
          pointerId: 1, pointerType: 'mouse', isPrimary: true
        }));
        for (var i = 1; i <= moves; i++) {
          var x = startX + (endX - startX) * i / moves;
          var y = startY + (endY - startY) * i / moves;
          document.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true, cancelable: true,
            clientX: x, clientY: y,
            pointerId: 1, pointerType: 'mouse', isPrimary: true
          }));
        }
        document.dispatchEvent(new PointerEvent('pointerup', {
          bubbles: true, cancelable: true,
          clientX: endX, clientY: endY,
          pointerId: 1, pointerType: 'mouse', isPrimary: true
        }));
      })();
    JS
  end

  def generate_selector_drag_code(from, to, target_dx, target_dy)
    to_offset = generate_offset_code(to)
    from_offset = generate_offset_code(from)
    "var drag_dx = #{to_offset}.left - #{from_offset}.left;" \
        "var drag_dy = #{to_offset}.top  - #{from_offset}.top;" \
        "$(\"#{from}\").simulate( 'drag', {handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def get_indexed_blockly_draggable_selector(index)
    ".blocklyDraggable:visible:eq(#{index - 1})"
  end

  def drag_indexed_block_to_offset(block_selector, dx, dy)
    # Blockly 13 registers listeners for pointer events (pointerdown/pointermove/pointerup)
    # via its TOUCH_MAP, so jQuery simulate's mouse-event drag no longer works.
    # Fire synthetic pointer events directly: pointerdown on the element,
    # then pointermove/pointerup on document (where Blockly binds those handlers).
    @browser.execute_script(<<~JS)
      (function() {
        var el = $("#{block_selector}").filter(function() {
          return $(this).parents(':hidden').length === 0;
        })[0];
        if (!el) return;
        var rect = el.getBoundingClientRect();
        var startX = rect.left + 1;
        var startY = rect.top + 1;
        var endX = startX + #{dx.to_i};
        var endY = startY + #{dy.to_i};
        var moves = 8;
        el.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true, cancelable: true,
          clientX: startX, clientY: startY,
          pointerId: 1, pointerType: 'mouse', isPrimary: true
        }));
        for (var i = 1; i <= moves; i++) {
          var x = startX + (endX - startX) * i / moves;
          var y = startY + (endY - startY) * i / moves;
          document.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true, cancelable: true,
            clientX: x, clientY: y,
            pointerId: 1, pointerType: 'mouse', isPrimary: true
          }));
        }
        document.dispatchEvent(new PointerEvent('pointerup', {
          bubbles: true, cancelable: true,
          clientX: endX, clientY: endY,
          pointerId: 1, pointerType: 'mouse', isPrimary: true
        }));
      })();
    JS
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
    js = "var xforms = $(\".blocklySvg [#{id_selector}='#{block_id}']\")[0].transform.baseVal; var firstXForm = xforms.getItem(0); if (firstXForm.type == SVGTransform.SVG_TRANSFORM_TRANSLATE){ var firstX = firstXForm.matrix.e; var firstY = firstXForm.matrix.f; }; return [firstX, firstY];"
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
    @browser.execute_script("return $(\".blocklySvg [#{id_selector}='#{block_id}']\").position().left")
  end

  def get_block_absolute_top(block_id)
    id_selector = get_id_selector
    @browser.execute_script("return $(\".blocklySvg [#{id_selector}='#{block_id}']\").position().top")
  end

  def get_block_workspace_left(block_id)
    @browser.execute_script("return Blockly.mainBlockSpace.getBlockById('#{block_id}').getRelativeToSurfaceXY().x;")
  end

  def get_block_workspace_top(block_id)
    @browser.execute_script("return Blockly.mainBlockSpace.getBlockById('#{block_id}').getRelativeToSurfaceXY().y;")
  end

  def modal_dialog_visible
    @browser.execute_script("return $('#modalContainer').is(':visible');")
  end
end

# Blockly encodes the id in the DOM element as the "data-id",
def get_id_selector
  'data-id'
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

def move_block_to_jigsaw_ghost(id)
  "var workspace = Blockly.getMainWorkspace();" \
  "var blockToMove = workspace.getBlockById('#{id}');" \
  "blockToMove.moveTo(appOptions.level.ghost);"
end

def load_json_blocks(blocks_json)
  script = "Blockly.serialization.workspaces.load(#{blocks_json}, Blockly.getMainWorkspace());"
  @browser.execute_script(script)
end

World(BlocklyHelpers)
