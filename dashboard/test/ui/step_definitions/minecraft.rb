Then /^I wait until the Minecraft game is loaded$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: 120)
  wait.until {@browser.execute_script('return Craft.phaserLoaded();')}
end
