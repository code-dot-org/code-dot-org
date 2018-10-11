require_relative './test_helper'
require_relative '../src/env'
require_relative '../helper_modules/hoc_event_review'
require_relative '../helpers/form_helpers'

# Tests for the HocEventReview helpers module.
class HocEventReviewTest < Minitest::Test
  DEFAULT_DATA = {
    email_s: 'fake@example.com',
    name_s: 'fake_name',
    organization_name_s: 'fake_org',
    event_type_s: 'in_school',
    hoc_country_s: 'us',
    email_preference_opt_in_s: 'yes'
  }.freeze

  DEFAULT_KIND = 'HocSignup2018'

  describe 'HocEventReview' do
    before do
      DCDO.stubs(:get).with('hoc_year', 2017).returns(2018)
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))
      row = insert_or_upsert_form(DEFAULT_KIND, DEFAULT_DATA.dup)
      @form = Form.find(id: row[:id])
    end

    it 'finds event counts by state' do
      with_form DEFAULT_DATA do |form|
        form.update(processed_data: {location_country_code_s: 'US', location_state_code_s: 'CA'}.to_json)
        form.refresh
        results = HocEventReview.event_counts_by_state
        assert_equal [{state_code: 'CA', count: 1}], results
      end
    end

    def with_form(form_data)
      row = insert_or_upsert_form DEFAULT_KIND, form_data.dup
      yield Form.find(id: row[:id])
    ensure
      PEGASUS_DB[:forms].where(id: row[:id]).delete if row
    end
  end
end
