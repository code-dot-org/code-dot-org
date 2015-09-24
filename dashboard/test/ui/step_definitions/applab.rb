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
