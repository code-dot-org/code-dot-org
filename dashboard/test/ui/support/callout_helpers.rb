module CalloutHelpers
  def is_callout_visible(callout_id)
    @browser.execute_script("return $('#qtip-#{callout_id}').is(':visible')")
  end

  def callout_exists(callout_id)
    @browser.execute_script("return $('#qtip-#{callout_id}').length != 0")
  end
end

World(CalloutHelpers)
