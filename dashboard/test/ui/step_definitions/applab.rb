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
  steps %q{
    And I am on "http://learn.code.org/projects/applab"
    And I rotate to landscape
    And I wait until element "#runButton" is visible
    And element "#codeModeButton" is visible
    And element "#designModeButton" is visible
    And element "#viewDataButton" is visible
  }
end

When /^I switch to design mode$/ do
  steps %q{
    When I press "designModeButton"
    And I wait to see Applab design mode
  }
end

When /^I switch to code mode$/ do
  steps %q{
    When I press "codeModeButton"
    And I wait to see Applab code mode
  }
end

When /^I switch to text mode$/ do
  steps %q{
    When I press "show-code-header"
    And I wait to see Droplet text mode
  }
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
      pageX: $("#visualization").offset().left,
      pageY: $("#visualization").offset().top
    });
    var mouseup = $.Event('mouseup', {
      pageX: $("#visualization").offset().left,
      pageY: $("#visualization").offset().top
    });
    element.trigger(mousedown);
    $(document).trigger(drag);
    $(document).trigger(mouseup);
  }
  @browser.execute_script(drag_script)
end

When /^I navigate to the shared version of my project$/ do
  steps %q{
    When I click selector ".project_share"
    And I wait to see a dialog titled "Share your project"
    And I navigate to the share URL
  }
end
