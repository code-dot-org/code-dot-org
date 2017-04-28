require_relative './test_helper'
require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'
require_relative '../../lib/cdo/pegasus'

class PdWorkshopSurveyTest < Minitest::Test
  describe 'PD Workshop Survey Form' do
    before do
      @required_data = {}
      @required_data[:user_id_i] = '1'
      @required_data[:email_s] = 'jdoe@example.net'
      @required_data[:name_s] = 'Jon Doe'

      @required_data[:name_s] = 'Jon Doe'

      @required_data[:enrollment_id_i] = '0'
      @required_data[:workshop_id_i] = '0'
      @required_data[:plp_b] = '0'
      @required_data[:include_demographics_b] = '0'

      @facilitators = ['Tom', 'Dick']

      @required_data[:facilitator_names_s] = @facilitators
    end

    it 'requires consent' do
      assert_raises FormError do
        validate_form('PdWorkshopSurvey', @required_data)
      end

      data = @required_data.merge(
        {
          consent_b: '0'
        }
      )

      # nothing raised
      validate_form('PdWorkshopSurvey', data)
    end

    it 'requires more data if consent is provdied' do
      data = @required_data.merge(
        {
          consent_b: '1'
        }
      )

      assert_raises FormError do
        validate_form('PdWorkshopSurvey', data)
      end
    end

    it 'supports no facilitators when none are expected' do
      data = @required_data.merge(
        {
          consent_b: '1',
          facilitator_names_s: []
        }
      )

      begin
        validate_form('PdWorkshopSurvey', data)
      rescue FormError => e
        assert_nil e.errors[:who_facilitated_ss]
      else
        assert false, "expected a FormError"
      end
    end

    it 'requires at least one facilitator when some are expected' do
      data = @required_data.merge(
        {
          consent_b: '1'
        }
      )

      begin
        validate_form('PdWorkshopSurvey', data)
      rescue FormError => e
        assert_equal [:required], e.errors[:who_facilitated_ss]
      else
        assert false, "expected a FormError"
      end

      data = @required_data.merge(
        {
          consent_b: '1',
          who_facilitated_ss: ['Tom']
        }
      )

      begin
        validate_form('PdWorkshopSurvey', data)
      rescue FormError => e
        assert_nil e.errors[:who_facilitated_ss]
      else
        assert false, "expected a FormError"
      end
    end

    it 'requires facilitator-specific responses for each specified facilitator' do
      data = @required_data.merge(
        {
          consent_b: '1',
          who_facilitated_ss: @facilitators
        }
      )

      begin
        validate_form('PdWorkshopSurvey', data)
      rescue FormError => e
        @facilitators.each do |facilitator|
          assert_equal [:invalid], e.errors[:"how_clearly_presented_s[#{facilitator}]"]
          assert_equal [:invalid], e.errors[:"how_interesting_s[#{facilitator}]"]
          assert_equal [:invalid], e.errors[:"how_often_given_feedback_s[#{facilitator}]"]
          assert_equal [:invalid], e.errors[:"help_quality_s[#{facilitator}]"]
          assert_equal [:invalid], e.errors[:"how_comfortable_asking_questions_s[#{facilitator}]"]
          assert_equal [:invalid], e.errors[:"how_often_taught_new_things_s[#{facilitator}]"]
        end
      else
        assert false, "expected a FormError"
      end

      data = @required_data.merge(
        {
          consent_b: '1',
          who_facilitated_ss: @facilitators,
          how_clearly_presented_s: {"Tom" => 'Extremely clearly', "Dick" => 'Not at all clearly'},
          how_interesting_s: {"Tom" => 'Extremely interesting', "Dick" => 'Not at all interesting'},
          how_often_given_feedback_s: {"Tom" => 'All the time', "Dick" => 'Almost never'},
          help_quality_s: {"Tom" => 'Extremely good', "Dick" => 'Not at all good'},
          how_comfortable_asking_questions_s: {"Tom" => 'Extremely comfortable', "Dick" => 'Not at all comfortable'},
          how_often_taught_new_things_s: {"Tom" => 'All the time', "Dick" => 'Almost never'}
        }
      )

      begin
        validate_form('PdWorkshopSurvey', data)
      rescue FormError => e
        @facilitators.each do |facilitator|
          assert_nil e.errors[:"how_clearly_presented_s[#{facilitator}]"]
          assert_nil e.errors[:"how_interesting_s[#{facilitator}]"]
          assert_nil e.errors[:"how_often_given_feedback_s[#{facilitator}]"]
          assert_nil e.errors[:"help_quality_s[#{facilitator}]"]
          assert_nil e.errors[:"how_comfortable_asking_questions_s[#{facilitator}]"]
          assert_nil e.errors[:"how_often_taught_new_things_s[#{facilitator}]"]
        end
      else
        assert false, "expected a FormError"
      end
    end
  end
end
