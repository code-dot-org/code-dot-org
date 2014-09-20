module BrowserHelpers
  def element_has_text(selector, expectedText)
    expectedText.gsub!('\"', '"')
    text = @browser.execute_script("return $(\"#{selector}\").text();")
    text.should eq expectedText
  end

  def element_contains_text(selector, expectedText)
    expectedText.gsub!('\"', '"')
    text = @browser.execute_script("return $(\"#{selector}\").text();")
    text.should include expectedText
  end

  def element_has_id(selector, expectedId)
    id = @browser.execute_script("return $(\"#{selector}\")[0].id;")
    id.should eq expectedId
  end

  def generate_generic_drag_code(fromSelector, toSelector, target_dx, target_dy)
    "var drag_dx = $(\"#{toSelector}\").position().left - $(\"#{fromSelector}\").position().left;" +
        "var drag_dy = $(\"#{toSelector}\").position().top  - $(\"#{fromSelector}\").position().top;" +
        "$(\"#{fromSelector}\").simulate( 'drag', {handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def wait
    Selenium::WebDriver::Wait.new(:timeout => 60 * 2)
  end

  def short_wait
    Selenium::WebDriver::Wait.new(:timeout => 5)
  end
end

World(BrowserHelpers)
