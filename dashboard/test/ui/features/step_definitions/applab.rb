# Which lesson of allthethings.script contains the App Lab levels; this way we
# only have to update in one place if this changes.
APPLAB_ALLTHETHINGS_LESSON = 18

When /^I add code for a canvas and a button$/ do
  code =
    "createCanvas('my_canvas', 320, 480);\\n" \
    "button('my_button', 'ButtonText');"
  add_code_to_editor(code)
end

And /^Applab HTML has a button$/ do
  code = @browser.execute_script "return Applab.levelHtml"
  expect(/button/.match(code).nil?).to be(false)
end

And /^Applab HTML has no button$/ do
  code = @browser.execute_script "return Applab.levelHtml"
  expect(/button/.match(code).nil?).to be(true)
end

Given /^I start a new Applab project/ do
  steps <<-STEPS
    And I am on "http://studio.code.org/projects/applab/new"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And element "#codeModeButton" is visible
    And element "#designModeButton" is visible
    And element "#dataModeButton" is visible
  STEPS
end

Given /^I am on the (\d+)(?:st|nd|rd|th)? App ?Lab test level$/ do |level_index|
  steps <<-STEPS
    And I am on "http://studio.code.org/s/allthethings/lessons/#{APPLAB_ALLTHETHINGS_LESSON}/levels/#{level_index}"
    And I rotate to landscape
    And I wait for the page to fully load
  STEPS
end

When /^I switch to design mode$/ do
  steps <<-STEPS
    When I press "designModeButton"
    And I wait to see Applab design mode
  STEPS
end

When /^I switch to data mode$/ do
  steps <<-STEPS
    When I press "dataModeButton"
    And I wait to see Applab data mode
  STEPS
end

When /^I switch to code mode$/ do
  steps <<-STEPS
    When I press "codeModeButton"
    And I wait to see Applab code mode
  STEPS
end

And /^I wait to see Applab design mode$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: 10)
  wait.until {@browser.execute_script("return $('#designWorkspace').css('display') == 'block';")}
end

And /^I wait to see Applab data mode$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: 10)
  wait.until {@browser.execute_script("return $('#dataWorkspaceWrapper').css('display') == 'block';")}
end

And /^I wait to see Applab code mode$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: 30)
  wait.until {@browser.execute_script("return $('#codeWorkspaceWrapper').css('display') == 'block';")}
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

When /^I navigate to the embedded version of my project$/ do
  steps <<-STEPS
    When I open the share dialog
    And I click selector "#project-share a:contains('Show advanced options')"
    And I click selector "#project-share li:contains('Embed')"
    And I copy the embed code into a new document
  STEPS
end

When /^I navigate to the embedded version of my project with source hidden$/ do
  steps <<-STEPS
    When I open the share dialog
    And I click selector "#project-share a:contains('Show advanced options')"
    And I click selector "#project-share li:contains('Embed')"
    And I click selector "#project-share label:contains('Hide ability to view code')"
    And I copy the embed code into a new document
  STEPS
end

Then(/^the palette has (\d+) blocks$/) do |num_blocks|
  expect(@browser.execute_script("return $('.droplet-palette-canvas > g').length")).to eq(num_blocks.to_i)
end

Then(/^the droplet code is "([^"]*)"$/) do |code|
  code.gsub!("\\n", "\n")
  expect(@browser.execute_script("return Applab.getCode()")).to eq(code)
end

And /^I append text to droplet "([^"]*)"$/ do |text|
  script = %Q{
    var aceEditor = window.__TestInterface.getDroplet().aceEditor;
    aceEditor.navigateFileEnd();
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
  # Run the script and then wait a little bit of time to give the UI a chance to reflow.
  @browser.execute_script(script, 0.5)
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

And /^I drag element "([^"]*)" ([\d]+) horizontally and ([\d]+) vertically$/ do |element_id, delta_x, delta_y|
  script = get_mouse_event_creator_script
  script += get_scale_script

  script += %Q{
    var element = $("#{element_id}");
    var scale = getScale(element[0]);

    var start = {
      x: element.offset().left,
      y: element.offset().top
    };

    var end = {
      x: start.x + (#{delta_x} * scale),
      y: start.y + (#{delta_y} * scale)
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

And /^I open the debug console$/ do
  steps 'And I click selector "#debug-area-header .fa-chevron-circle-up" if it exists'
end

Then(/^the share link includes "([^"]*)"$/) do |expected_text|
  share_link_input = nil
  wait_short_until do
    share_link_input = @browser.find_element(:css, '#sharing-input')
  end
  expect(share_link_input.attribute('value')).to include(expected_text)
end

table_name = nil
Then /^I save the table name from element "([^"]*)"$/ do |selector|
  table_name = @browser.execute_script("return $('#{selector}').text()")
end

Then /^I wait until (?:element )?"([^"]*)" (?:has|contains) the saved table name$/ do |selector|
  wait_until {@browser.execute_script("return $(#{selector.dump}).text();").include? table_name}
end
