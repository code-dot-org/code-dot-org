require 'cdo/anon_user_id'
require 'cdo/shared_constants'

Then('I remember the generated Statsig stable ID') do
  @statsig_stable_id = @browser.find_element(css: 'body').text.strip
  expect(@statsig_stable_id).to match(Cdo::AnonUserId::FORMAT)
end

Then('the Statsig stable ID response is {string}') do |stable_id|
  expect(@browser.find_element(css: 'body').text.strip).to eq(stable_id)
end

Then('the Statsig stable ID response matches the expected UUID') do
  expect(@browser.find_element(css: 'body').text.strip).to eq(@statsig_stable_id)
end

When('I set performance cookie consent to {string}') do |consent|
  expect(['enabled', 'disabled']).to include(consent)
  enabled = consent == 'enabled'
  checkbox = @browser.find_element(css: '#ot-group-id-C0002')
  unless checkbox.selected? == enabled
    @browser.find_element(css: "label[for='ot-group-id-C0002']").click
  end
  wait_until {checkbox.selected? == enabled}
end

Then(/^performance cookies are (enabled|disabled)$/) do |consent|
  wait_until do
    @browser.execute_script(<<~JS, consent == 'enabled')
      const groups = (window.OnetrustActiveGroups || '').split(',');
      return groups.includes('C0001') && groups.includes('C0002') === arguments[0];
    JS
  end
end

Then('the Statsig stable ID cookie is not set') do
  expect(get_cookie(SharedConstants::STATSIG_STABLE_ID_KEY)).to be_nil
end

Then('the Statsig stable ID cookie matches the API response') do
  cookie = wait_until {get_cookie(SharedConstants::STATSIG_STABLE_ID_KEY)}
  expect(cookie[:value]).to eq(@statsig_stable_id)
end

Then('the Statsig stable ID cookie is a different UUID from the API response') do
  cookie = wait_until {get_cookie(SharedConstants::STATSIG_STABLE_ID_KEY)}
  expect(cookie[:value]).to match(Cdo::AnonUserId::FORMAT)
  expect(cookie[:value]).not_to eq(@statsig_stable_id)
end
