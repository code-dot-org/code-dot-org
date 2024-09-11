require 'redcarpet'

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

  def element_has_i18n_text(selector, language, loc_key, rtl: false)
    loc_key.gsub!('\"', '"')
    # grab text from the browser, replacing non-breaking spaces with regular ones
    text = @browser.execute_script("return $(\"#{selector}\").text().replace(/\u00a0/g, ' ');").strip
    # Get localized text from server
    response = HTTParty.get(replace_hostname("http://studio.code.org/api/test/get_i18n_t?key=#{loc_key}&locale=#{language}")).parsed_response
    # RTL text can include the RLM character, which can be safely ignored here
    if rtl
      text.should include response.strip
    else
      text.should eq response.strip
    end
  end

  # This function checks that the text within the given selector matches the
  # text produced by rendering the markdown given by the localization string.
  #
  # This is used to test that localized markdown is being rendered in any given
  # container element.
  def element_has_i18n_markdown(selector, language, loc_key)
    loc_key.gsub!('\"', '"')

    # Grab html of the markdown container from the browser.
    html = @browser.execute_script("return $(\"#{selector}\").html();")

    # Get localized markdown from server.
    response = HTTParty.get(replace_hostname("http://studio.code.org/api/test/get_i18n_t?key=#{loc_key}&locale=#{language}")).parsed_response

    # Render the markdown and remove whitespace.
    renderer = Redcarpet::Markdown.new(Redcarpet::Render::HTML.new(filter_html: true))
    expected_html = renderer.render(response)

    # Compare just the text, assuming the structure is correct as we only care
    # that the localized strings are being used. We remove whitespace to avoid
    # any minor issues when the Markdown produces multiple newlines.
    text = Nokogiri::HTML(html).text.gsub(/\s/, "")
    expected_text = Nokogiri::HTML(expected_html).text.gsub(/\s/, "")

    text.should eq expected_text
  end

  def element_text(selector)
    @browser.execute_script("return $(\"#{selector}\").text();")
  end

  def element_contains_text(selector, expected_text)
    expected_text.gsub!('\"', '"')
    expect(element_text(selector)).to include expected_text
  end

  def element_contains_text?(selector, expected_text)
    expected_text.gsub!('\"', '"')
    text = element_text(selector)
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

  def element_has_css_multiple_properties(selector, properties, expected_value)
    expected = false
    properties.each do |property|
      expected ||= (element_css_value(selector, property) == (expected_value))
    end
    expected
  end

  def element_css_value(selector, property)
    @browser.execute_script("return $(\"#{selector}\").css(\"#{property}\");")
  end

  def generate_generic_drag_code(from_selector, to_selector, target_dx, target_dy)
    "var drag_dx = $(\"#{to_selector}\").position().left - $(\"#{from_selector}\").position().left;" \
        "var drag_dy = $(\"#{to_selector}\").position().top  - $(\"#{from_selector}\").position().top;" \
        "$(\"#{from_selector}\").simulate( 'drag', {handle: 'corner', dx: drag_dx + #{target_dx}, dy: drag_dy + #{target_dy}, moves: 5});"
  end

  def install_js_error_recorder
    with_read_timeout(10.seconds) do
      @browser.execute_script(<<-JS
      // Wrap existing window onerror handler with a script error recorder.
      var windowOnError = window.onerror;
      window.onerror = function (msg) {
        window.detectedJSErrors = window.detectedJSErrors || [];
        window.detectedJSErrors.push(msg);
        if (windowOnError) {
          return windowOnError.apply(this, arguments);
        }
      };
      JS
      )
    end
  rescue => exception
    puts "DEBUG: Unable to install js error recorder; #{exception}"
  end

  def check_window_for_js_errors(check_reason_description)
    unless @browser.nil?
      with_read_timeout(10.seconds) do
        js_errors = @browser.execute_script('return window.detectedJSErrors;')
        if js_errors
          puts "DEBUG: [#{check_reason_description}] JS errors: #{CGI.escapeHTML js_errors.join(' | ')}"
        else
          puts "DEBUG: [#{check_reason_description}] No JS errors found on current page." if ENV['VERY_VERBOSE']
        end
      end
    end
  rescue => exception
    # We're not currently failing any tests based on JS errors showing up, so
    # this is just a debugging tool.
    # We're getting intermittent timing errors that have to do with SauceLabs
    # going away before we can check for JS errors.
    # We don't want that to cause test runs to fail, so ignore exceptions for now.
    puts "DEBUG: Unable to check window for JS errors; #{exception}"
  end

  def wait
    Selenium::WebDriver::Wait.new(timeout: 60 * 2)
  end

  def short_wait
    Selenium::WebDriver::Wait.new(timeout: 5)
  end
end

World(BrowserHelpers)
