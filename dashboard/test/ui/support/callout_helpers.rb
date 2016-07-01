module CalloutHelpers
  def callout_visible?(callout_id)
    @browser.execute_script("return $('.cdo-qtips').eq('#{callout_id}').is(':visible')")
  end

  def callout_exists?(callout_id)
    @browser.execute_script("return $('.cdo-qtips').eq('#{callout_id}').length != 0")
  end

  def callout_has_text?(callout_id, expected_text)
    expected_text.gsub!('\"', '"')
    text = @browser.execute_script("return $('.cdo-qtips').eq('#{callout_id}').text();")
    text.should eq expected_text
  end
end

World(CalloutHelpers)
