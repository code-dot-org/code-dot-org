module CalloutHelpers
  def is_callout_visible(callout_id)
    @browser.execute_script("return $('.cdo-qtips').eq('#{callout_id}').is(':visible')")
  end

  def callout_exists(callout_id)
    @browser.execute_script("return $('.cdo-qtips').eq('#{callout_id}').length != 0")
  end

  def callout_has_text(callout_id, expectedText)
    expectedText.gsub!('\"', '"')
    text = @browser.execute_script("return $('.cdo-qtips').eq('#{callout_id}').text();")
    text.should eq expectedText
  end
end

World(CalloutHelpers)
