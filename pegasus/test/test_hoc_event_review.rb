require_relative './test_helper'
require_relative '../src/env'
require_relative '../helper_modules/hoc_event_review'
require_relative '../helpers/form_helpers'

# Tests for the HocEventReview helpers module.
class HocEventReviewTest < Minitest::Test
  describe 'HocEventReview' do
    before do
      assert_empty HocEventReview.events, 'Precondition: No HOC events in test DB'
    end

    it 'finds event counts by state' do
      with_form location_country_code_s: 'US', location_state_code_s: 'CA' do
        with_form location_country_code_s: 'US', location_state_code_s: 'CA' do
          with_form location_country_code_s: 'US', location_state_code_s: 'OR' do
            with_form location_country_code_s: 'MX' do
              expected = [
                {state_code: 'CA', count: 2},
                {state_code: 'OR', count: 1},
              ]
              actual = HocEventReview.event_counts_by_state
              assert_equal expected, actual
            end
          end
        end
      end
    end

    it 'finds event counts by country' do
      with_form location_country_code_s: 'US', location_state_code_s: 'OR' do
        with_form location_country_code_s: 'MX' do
          with_form location_country_code_s: 'MX' do
            with_form location_country_code_s: 'IT' do
              expected = [
                {country_code: 'IT', count: 1},
                {country_code: 'MX', count: 2},
              ]
              actual = HocEventReview.event_counts_by_country
              assert_equal expected, actual
            end
          end
        end
      end
    end

    it 'finds event details' do
      with_form location_country_code_s: 'US', location_state_code_s: 'CA' do
        with_form location_country_code_s: 'US', location_state_code_s: 'OR' do
          with_form location_country_code_s: 'MX' do
            actual = HocEventReview.events
            assert_equal 3, actual.size
          end
        end
      end
    end

    # Helper to temporarily create a form row for testing retrieval methods.
    DEFAULT_KIND = HocEventReview.send(:kind)
    def with_form(processed_data)
      # Necessary stubs for the insert_or_upsert_form helper
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))

      # Add fake row
      row = insert_or_upsert_form DEFAULT_KIND, HocEventReviewTest.fake_data

      # Add fake processed data to fake row
      form = Form.find(id: row[:id])
      form.update(processed_data: processed_data.to_json)
      form.refresh

      # Run enclosed logic
      yield form
    ensure
      # Clean up fake row
      PEGASUS_DB[:forms].where(id: row[:id]).delete if row
    end
  end

  # Fake form data, with unique name/email because our form logic
  # deduplicates submissions with the same name/email combo.
  def self.fake_data
    @@next_id ||= 0
    @@next_id += 1
    {
      email_s: "fake#{@@next_id}@example.com",
      name_s: "fake#{@@next_id}_name",
      organization_name_s: 'fake_org',
      event_type_s: 'in_school',
      hoc_country_s: 'us',
      email_preference_opt_in_s: 'yes'
    }
  end
end
