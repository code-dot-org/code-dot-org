When /^I add code for a canvas and a button$/ do
  code =
    "createCanvas('my_canvas', 320, 480);\\n" +
    "button('my_button', 'ButtonText');"
  add_code_to_editor(code)
end

def add_code_to_editor(code)
  script =
    "var aceEditor = __TestInterface.getDroplet().aceEditor;\n" +
    "aceEditor.textInput.focus();\n" +
    "aceEditor.onTextInput(\"#{code}\");\n"

  @browser.execute_script(script)
end

And /^Applab HTML has a button$/ do
  code = @browser.execute_script "return Applab.levelHtml"
  /button/.match(code).nil?.should eq false
end

And /^Applab HTML has no button$/ do
  code = @browser.execute_script "return Applab.levelHtml"
  /button/.match(code).nil?.should eq true
end

Given /^I start a new Applab project$/ do
  steps <<-STEPS
    And I am on "http://learn.code.org/projects/applab/new"
    And I rotate to landscape
    And I wait to see "#runButton"
    And element "#runButton" is visible
    And element "#codeModeButton" is visible
    And element "#designModeButton" is visible
    And element "#viewDataButton" is visible
  STEPS
end

When /^I switch to design mode$/ do
  steps <<-STEPS
    When I press "designModeButton"
    And I wait to see Applab design mode
  STEPS
end

When /^I switch to code mode$/ do
  steps <<-STEPS
    When I press "codeModeButton"
    And I wait to see Applab code mode
  STEPS
end

When /^I switch to text mode$/ do
  steps <<-STEPS
    When I press "show-code-header"
    And I wait to see Droplet text mode
  STEPS
end

And /^I wait to see Applab design mode$/ do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return $('#designWorkspace').css('display') == 'block';") }
end

And /^I wait to see Applab code mode$/ do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return $('#codeWorkspaceWrapper').css('display') == 'block';") }
end

# Step for dragging an Applab design mode element into the applab visualization.
# Use with element type strings from ElementType (library.js)
When /^I drag a (\w+) into the app$/ do |element_type|
  drag_script = %Q{
    var element = $("[data-element-type='#{element_type}']");
    var screenOffset = element.offset();
    var mousedown = $.Event("mousedown", {
      which: 1,
      pageX: screenOffset.left,
      pageY: screenOffset.top
    });
    var drag = $.Event("mousemove", {
      pageX: $("#visualization").offset().left + 15,
      pageY: $("#visualization").offset().top
    });
    var mouseup = $.Event('mouseup', {
      pageX: $("#visualization").offset().left + 15,
      pageY: $("#visualization").offset().top
    });
    element.trigger(mousedown);
    $(document).trigger(drag);
    $(document).trigger(mouseup);
  }
  @browser.execute_script(drag_script)
end

When /^I navigate to the shared version of my project$/ do
  steps <<-STEPS
    When I click selector ".project_share"
    And I wait to see a dialog titled "Share your project"
    And I navigate to the share URL
  STEPS
end

When /^I navigate to the embedded version of my project$/ do
  steps <<-STEPS
    When I click selector ".project_share"
    And I wait to see a dialog titled "Share your project"
    And I click selector "#project-share a:contains('Show advanced options')"
    And I copy the embed code into a new document
  STEPS
end

Then(/^the palette has (\d+) blocks$/) do |num_blocks|
  @browser.execute_script("return $('.droplet-palette-scroller-stuffing > .droplet-hover-div').length").should eq num_blocks.to_i
end

Then(/^the droplet code is "([^"]*)"$/) do |code|
  code.gsub!("\\n", "\n")
  @browser.execute_script("return Applab.getCode()").should eq code
end

And /^I append text to droplet "([^"]*)"$/ do |text|
  script = %Q{
    var aceEditor = window.__TestInterface.getDroplet().aceEditor;
    aceEditor.textInput.focus();
    aceEditor.onTextInput("#{text}");
  }
  @browser.execute_script(script)
end

def set_nth_input(n, value)
  elements = @browser.find_elements(:css, '#design-properties input')
  # For some reason, the test machine seemed to stop responding to :delete. Even
  # stranger, on my localhost, if I do a bunch of backspaces without following
  # them with a delete, the press_keys(value) is ignored. By having both here,
  # things seem to work both on test and in development
  press_keys(elements[n], "\b") # backspace
  press_keys(elements[n], "\b") # backspace
  press_keys(elements[n], "\b") # backspace
  press_keys(elements[n], "\b") # backspace
  press_keys(elements[n], ":delete")
  press_keys(elements[n], ":delete")
  press_keys(elements[n], ":delete")
  press_keys(elements[n], ":delete")
  press_keys(elements[n], value)
end

And /^I set input "([^"]*)" to "([^"]*)"$/ do |type, value|
  case type
  when 'xpos'
    # first key press will just clear the current value
    set_nth_input(3, value)
  when 'ypos'
    set_nth_input(4, value)
  else
    raise 'Unknown type'
  end
end

And /^I set groupable input "([^"]*)" to "([^"]*)"$/ do |type, value|
  case type
  when 'xpos'
    # first key press will just clear the current value
    set_nth_input(4, value)
  when 'ypos'
    set_nth_input(5, value)
  else
    raise 'Unknown type'
  end
end

And /^I delete the current design mode element$/ do
  elements = @browser.find_elements(:css, '#design-properties button')
  elements[0].click
end

def drag_grippy(element_js, delta_x, delta_y)
  script = get_mouse_event_creator_script

  script += %Q{
    var element = #{element_js};
    var start = {
      x: element.offset().left,
      y: element.offset().top
    };
    var end = {
      x: start.x + #{delta_x},
      y: start.y + #{delta_y}
    }
    var mousedown = createMouseEvent('mousedown', start.x, start.y);
    var drag = createMouseEvent('mousemove', end.x, end.y);
    var mouseup = createMouseEvent('mouseup', end.x, end.y);

    element[0].dispatchEvent(mousedown);
    element[0].dispatchEvent(drag);
    element[0].dispatchEvent(mouseup);
  }

  @browser.execute_script(script)
end

And /^I drag the instructions grippy by ([-|\d]+) pixels$/ do |delta|
  drag_grippy('$(".fa-ellipsis-h").eq(0).parent()', 0, delta)
end

And /^I drag the visualization grippy by ([-|\d]+) pixels$/ do |delta|
  drag_grippy('$("#visualizationResizeBar")', delta, 0)
end

And /^I hover over element with id "([^"]*)"$/ do |element_id|
  script = get_mouse_event_creator_script
  script += get_scale_script

  script += %Q{
    var element = $("#" + "#{element_id}");
    var scale = getScale(element[0]);
    var x = element.offset().left + (5 * scale);
    var y = element.offset().top + (5 * scale);

    var mousemove = createMouseEvent('mousemove', x, y);

    element[0].dispatchEvent(mousemove);
  }

  @browser.execute_script(script)
end

And /^I hover over the screen at xpos ([\d]+) and ypos ([\d]+)$/ do |xpos, ypos|
  script = get_mouse_event_creator_script
  script += get_scale_script

  script += %Q{
    var visualization = $("#visualizationOverlay");
    var transform = window.getComputedStyle(visualization[0]).transform;
    var scale = parseFloat(/matrix\\(([^,]*),/.exec(transform)[1]);
    var x = visualization.offset().left + (#{xpos} * scale);
    var y = visualization.offset().top + (#{ypos} * scale);
    var mousemove = createMouseEvent('mousemove', x, y);

    visualization[0].dispatchEvent(mousemove);
  }

  @browser.execute_script(script)
end

def get_mouse_event_creator_script
  return <<-FUNCTION
    function createMouseEvent(type, clientX, clientY) {
      var evt;
      var e = {
        bubbles: true,
        cancelable: (type != "mousemove"),
        view: window,
        detail: 0,
        screenX: undefined,
        screenY: undefined,
        clientX: clientX,
        clientY: clientY,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: undefined
      };
      if (typeof( document.createEvent ) == "function") {
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(type,
          e.bubbles, e.cancelable, e.view, e.detail,
          e.screenX, e.screenY, e.clientX, e.clientY,
          e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
          e.button, document.body.parentNode);
      } else if (document.createEventObject) {
        evt = document.createEventObject();
        for (var prop in e) {
          evt[prop] = e[prop];
        }
        evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
      }
      return evt;
    };
  FUNCTION
end

def get_scale_script
  return <<-FUNCTION
    function getScale(element) {
      return element.getBoundingClientRect().width / element.offsetWidth;
    };
  FUNCTION
end

And /^I save the project$/ do
  script = <<-SCRIPT
    Applab.serializeAndSave();
  SCRIPT

  @browser.execute_script(script)
end
