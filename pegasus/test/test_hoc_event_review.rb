require_relative './test_helper'
require_relative '../src/env'
require_relative '../helper_modules/hoc_event_review'
require_relative '../helpers/form_helpers'

# Tests for the HocEventReview helpers module.
class HocEventReviewTest < Minitest::Test
  describe 'HocEventReview' do
    before do
      if HocEventReview.events.count > 0
        PEGASUS_DB[:forms].where(kind: HocEventReview.kind).delete
      end
      assert_empty HocEventReview.events, 'Precondition: No HOC events in test DB'
    end

    it 'finds event counts by state' do
      with_form country: 'US', state: 'CA' do
        with_form country: 'US', state: 'CA' do
          with_form country: 'US', state: 'OR' do
            with_form country: 'MX' do
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

    it 'can filter to unreviewed events' do
      with_form country: 'US', state: 'CA', review: 'approved' do
        with_form country: 'US', state: 'OR' do
          expected = [
            {state_code: 'OR', count: 1},
          ]
          actual = HocEventReview.event_counts_by_state reviewed: false
          assert_equal expected, actual
        end
      end
    end

    it 'can filter to special events' do
      with_form country: 'US', state: 'CA', special_event: 1 do
        with_form country: 'US', state: 'OR' do
          expected = [
            {state_code: 'CA', count: 1},
          ]
          actual = HocEventReview.event_counts_by_state special_events_only: true
          assert_equal expected, actual
        end
      end
    end

    it 'finds event counts by country' do
      with_form country: 'US', state: 'OR' do
        with_form country: 'MX' do
          with_form country: 'MX' do
            with_form country: 'IT' do
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
      with_form country: 'US', state: 'CA' do
        with_form country: 'US', state: 'OR' do
          with_form country: 'MX' do
            actual = HocEventReview.events
            assert_equal 3, actual.size
          end
        end
      end
    end

    it 'can filter to state' do
      with_form country: 'US', state: 'CA' do
        with_form country: 'US', state: 'OR' do
          with_form country: 'MX' do
            actual = HocEventReview.events state: 'CA'
            assert_equal 1, actual.size
          end
        end
      end
    end

    it 'can filter to country' do
      with_form country: 'US', state: 'CA' do
        with_form country: 'US', state: 'OR' do
          with_form country: 'MX' do
            actual = HocEventReview.events country: 'US'
            assert_equal 2, actual.size
          end
        end
      end
    end

    it 'only finds events with processed data' do
      with_form country: 'US', state: 'CA', has_processed_data: false do
        with_form country: 'US', state: 'OR' do
          with_form country: 'MX' do
            actual = HocEventReview.events
            assert_equal 2, actual.size
          end
        end
      end
    end

    # Helper to temporarily create a form row for testing retrieval methods.
    def with_form(
      review: nil,
      special_event: nil,
      state: nil,
      country: nil,
      has_processed_data: true
    )
      # Necessary stubs for the insert_or_upsert_form helper
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))

      data = HocEventReviewTest.fake_data.merge(
        special_event_flag_b: special_event
      )

      # Add fake row
      row = insert_or_upsert_form(
        HocEventReview.kind,
        data
      )

      # Adjust fake row
      form = Form.find(id: row[:id])
      form.update(review: review) unless review.nil?

      if has_processed_data
        processed_data = {
          location_country_code_s: country,
          location_state_code_s: state
        }
        form.update(processed_data: processed_data.to_json)
      end

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
