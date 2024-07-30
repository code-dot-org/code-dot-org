Then /^I load the last Minecraft HoC level$/ do
  Retryable.retryable(
    {
      on: [
        RSpec::Expectations::ExpectationNotMetError,
        Selenium::WebDriver::Error::TimeoutError
      ],
      sleep: 10,
      tries: 3
    }
  ) do
    steps <<-STEPS
      Given I am on "http://studio.code.org/s/mc/lessons/1/levels/14?noautoplay=true&customSlowMotion=0.1"
      And I wait for the lab page to fully load
      And I wait until the Minecraft game is loaded
    STEPS
  end
end

Then /^I wait until the Minecraft game is loaded$/ do
  wait = Selenium::WebDriver::Wait.new(timeout: 60)
  wait.until {@browser.execute_script('return Craft.phaserLoaded();')}
end
