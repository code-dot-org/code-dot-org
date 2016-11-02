Then /^I resize top instructions to "(\d*)" pixels tall$/ do |height|
  @browser.execute_script("StudioApp.singleton.reduxStore.dispatch({type: 'instructions/SET_INSTRUCTIONS_RENDERED_HEIGHT', height: #{height}})")
end
