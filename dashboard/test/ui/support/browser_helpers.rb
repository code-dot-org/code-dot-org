module BrowserHelpers
  def element_has_text(selector, expected_text)
    expected_text.gsub!('\"', '"')
    text = @browser.execute_script("return $(\"#{selector}\").text();")
    expect(text).to eq(expected_text)
  end

  def element_has_html(selector, expected_html)
    expected_html.gsub!('\"', '"')
    text = @browser.execute_script("return $(\"#{selector}\").html();")
    expect(text).to eq(expected_html)
  end

  def element_has_i18n_text(selector, language, loc_key)
    require_rails_env
    loc_key.gsub!('\"', '"')
    text = @browser.execute_script("return $(\"#{selector}\").text();")
    text.should eq I18n.t loc_key, locale: language
  end

  def element_contains_text(selector, expected_text)
    expect(element_contains_text?(selector, expected_text)).to be true
  end

  def element_contains_text?(selector, expected_text)
    expected_text.gsub!('\"', '"')
    text = @browser.execute_script("return $(\"#{selector}\").text();")
    text.strip.include? expected_text
  end

  def element_value_is(selector, expected_value)
    value = @browser.execute_script("return $(\"#{selector}\").val();")
    expect(value.strip).to eq(expected_value)
  end

  def element_has_id(selector, expected_id)
    id = @browser.execute_script("return $(\"#{selector}\")[0].id;")
    expect(id).to eq(expected_id)
  end

  def element_has_attribute(selector, attribute, expected_text)
    expected_text.gsub!('\"', '"')
    text = @browser.execute_script("return $(\"#{selector}\").attr(\"#{attribute}\");")
    expect(text).to eq(expected_text)
  end

  def element_has_css(selector, property, expected_value)
    expect(element_css_value(selector, property)).to eq(expected_value)
  end

  def element_css_value(selector, property)
    @browser.execute_script("return $(\"#{selector}\").css(\"#{property}\");")
  end

  def generate_generic_drag_code(from_selector, to_selector, target_dx, target_dy)
    "var drag_dx = $(\"#{to_selector}\").position().left - $(\"#{from_selector}\").position().left;" \
        "var drag_dy = $(\"#{to_selector}\").position().top  - $(\"#{from_selector}\").position().top;" \
        "$(\"#{from_selector}\").simulate( 'drag', {handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def wait
    Selenium::WebDriver::Wait.new(:timeout => 60 * 2)
  end

  def short_wait
    Selenium::WebDriver::Wait.new(:timeout => 5)
  end
end

World(BrowserHelpers)
