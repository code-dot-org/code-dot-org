require_relative './test_helper'
require_relative '../src/env'
require_relative '../helper_modules/forms'
require_relative '../helpers/form_helpers'

# Tests for the Forms helpers module.
class FormsTest < Minitest::Test
  DEFAULT_DATA = {
    email_s: 'fake@example.com',
    name_s: 'fake_name',
    organization_name_s: 'fake_org',
    event_type_s: 'in_school',
    hoc_country_s: 'us',
    email_preference_opt_in_s: 'yes'
  }.freeze

  DEFAULT_KIND = 'HocSignup2017'

  describe 'Forms' do
    before do
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))
      row = insert_or_upsert_form(DEFAULT_KIND, DEFAULT_DATA.dup)
      @form = Form.find(id: row[:id])
    end

    it 'events_by_country' do
      @form.update(processed_data: {location_country_code_s: 'IT'}.to_json)
      assert_equal([{country_code: 'IT', count: 1}], Forms.events_by_country(DEFAULT_KIND))
    end

    it 'events_by_state' do
      @form.update(processed_data: {location_country_code_s: 'US', location_state_code_s: 'CA'}.to_json)
      assert_equal([{state_code: 'CA', count: 1}], Forms.events_by_state(DEFAULT_KIND))
    end

    it 'events_by_name' do
      processed_data = {
        location_country_code_s: 'US',
        location_state_code_s: 'CA',
        location_city_s: 'San Diego'
      }
      @form.update(processed_data: processed_data.to_json)
      events = Forms.events_by_name(DEFAULT_KIND, 'US', 'CA')
      assert_equal([{name: DEFAULT_DATA[:organization_name_s], city: processed_data[:location_city_s]}], events)
    end
  end
end
