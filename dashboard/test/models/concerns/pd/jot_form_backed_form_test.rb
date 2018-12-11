require 'test_helper'

module Pd
  class DummyForm < ActiveRecord::Base
    include Pd::JotFormBackedForm

    # @override
    def self.unique_attributes
      [:unique_key]
    end
  end

  class DummyFormWithStaticAttributeValues < DummyForm
    def self.static_attribute_values
      {custom_field: 'fixed value'}
    end
  end

  class DummyFormWithAttributeMapping < DummyForm
    def self.attribute_mapping
      {custom_field: 'field1'}
    end
  end

  class JotFormBackedFormTest < ActiveSupport::TestCase
    FORM_ID = 100001
    SUBMISSION_ID = 200001
    FAKE_ANSWERS = {
      field1: 'answer1',
      field2: 'answer2'
    }.stringify_keys.freeze

    self.use_transactional_test_case = true

    setup_all do
      # create a temporary table for our DummyForm record. Note that because the
      # table is temporary, it will be automatically destroyed once the session has
      # ended so we don't need to worry about dropping the table in teardown
      ActiveRecord::Base.connection.create_table(:pd_dummy_forms, temporary: true) do |t|
        t.integer :form_id, length: 8
        t.integer :submission_id, length: 8
        t.string :unique_key
        t.string :custom_field
        t.text :answers
      end
    end

    setup do
      JotForm::JotFormRestClient.expects(:new).never
      DummyForm.stubs(:get_min_date)
    end

    test 'form_id and submission_id are required' do
      form = DummyForm.new
      assert form.invalid?
      assert_equal(
        [
          'Form is required',
          'Submission is required'
        ],
        form.errors.full_messages
      )

      form.form_id = get_form_id
      form.submission_id = get_submission_id
      assert form.valid?
    end

    test 'placeholder?' do
      placeholder = DummyForm.new placeholder_params
      with_answers = DummyForm.new params_with_answers

      assert placeholder.placeholder?
      refute with_answers.placeholder?
    end

    test 'response_exists? raises error when missing form_id' do
      e = assert_raises do
        DummyForm.response_exists?(unique_key: generate_unique_key)
      end
      assert e.message.include? 'Missing required attributes [:form_id]'
    end

    test 'response_exists? raises error when missing a unique attribute' do
      e = assert_raises do
        DummyForm.response_exists?(form_id: get_form_id)
      end
      assert e.message.include? 'Missing required attributes [:unique_key]'
    end

    test 'response_exists?' do
      placeholder = DummyForm.create! placeholder_params

      assert DummyForm.response_exists?(form_id: placeholder.form_id, unique_key: placeholder.unique_key)
      refute DummyForm.response_exists?(form_id: placeholder.form_id, unique_key: generate_unique_key)
    end

    test 'create_placeholder! raises error when missing form_id' do
      e = assert_raises do
        DummyForm.create_placeholder!(unique_key: generate_unique_key)
      end
      assert e.message.include? 'Missing required attributes [:form_id]'
    end

    test 'create_placeholder! raises error when missing a unique attribute' do
      e = assert_raises do
        DummyForm.create_placeholder!(form_id: get_form_id)
      end
      assert e.message.include? 'Missing required attributes [:unique_key]'
    end

    test 'create_placeholder! raises error when missing submission_id' do
      e = assert_raises do
        DummyForm.create_placeholder!(unique_key: generate_unique_key, form_id: get_form_id)
      end
      assert e.message.include? 'Expected submission_id'
    end

    test 'create_placeholder! creates a placeholder' do
      assert_creates DummyForm do
        DummyForm.create_placeholder! placeholder_params
      end
    end

    test 'create_placeholder! logs a warning and skips duplicate submissions' do
      original = DummyForm.create! placeholder_params
      next_submission_id = get_submission_id

      CDO.log.expects(:warn).with("Ignoring duplicate placeholder. Original: #{original.submission_id}, New: #{next_submission_id}")
      duplicate = assert_does_not_create DummyForm do
        DummyForm.create_placeholder!(
          # Same form and unique key, new submission
          form_id: original.form_id, unique_key: original.unique_key, submission_id: next_submission_id
        )
      end

      assert_equal original, duplicate
    end

    test 'static attribute values are included on new objects' do
      form = DummyFormWithStaticAttributeValues.new
      assert_equal 'fixed value', form.custom_field
    end

    test 'static attribute values are included in placeholders' do
      placeholder = DummyFormWithStaticAttributeValues.create_placeholder! placeholder_params
      assert_equal 'fixed value', placeholder.custom_field
    end

    test 'static attribute values are included in response_exists? queries' do
      form_id = get_form_id
      unique_key = generate_unique_key
      DummyFormWithStaticAttributeValues.expects(:exists?).with(
        form_id: form_id, unique_key: unique_key, custom_field: 'fixed value'
      )

      DummyFormWithStaticAttributeValues.response_exists?(
        form_id: form_id, unique_key: unique_key
      )
    end

    test 'duplicate? returns true for new records that match existing unique attributes' do
      unique_key = generate_unique_key
      form_id = get_form_id
      form = DummyForm.new(
        form_id: form_id, unique_key: unique_key, submission_id: get_submission_id
      )

      DummyForm.expects(:exists?).with('unique_key' => unique_key, 'form_id' => form_id).returns(true)
      assert form.duplicate?

      DummyForm.expects(:exists?).with('unique_key' => unique_key, 'form_id' => form_id).returns(false)
      refute form.duplicate?

      form.expects(:new_record?).returns(false)
      DummyForm.expects(:exists?).never
      refute form.duplicate?
    end

    test 'fill_placeholders syncs each placeholder' do
      mock_placeholders = 2.times.map do
        mock {|mock_placeholder| mock_placeholder.expects(:sync_from_jotform)}
      end

      DummyForm.expects(:placeholders).returns(
        mock do |_mock_query|
          expects(:find_each).multiple_yields(*mock_placeholders)
        end
      )
      CDO.log.expects(:info).with('2 placeholders filled.')

      DummyForm.fill_placeholders
    end

    test 'fill_placeholders collects errors and re-raises at the end' do
      form_id = get_form_id
      failed_submission_ids = 2.times.map {get_submission_id}

      mock_placeholders = [
        mock {|_mock_successful_placeholder| expects(:sync_from_jotform)},
        mock do |_first_mock_failed_placeholder|
          expects(:sync_from_jotform).raises('Test error 1').twice
          expects(:submission_id).returns(failed_submission_ids[0])
          expects(:form_id).returns(form_id).twice
          expects(:force_sync_questions)
        end,
        mock do |_second_mock_failed_placeholder|
          expects(:sync_from_jotform).raises('Test error 2').once
          expects(:submission_id).returns(failed_submission_ids[1])
          expects(:form_id).returns(form_id)
          expects(:force_sync_questions).never
        end,
        mock {|_mock_successful_placeholder| expects(:sync_from_jotform)}
      ]

      DummyForm.expects(:placeholders).returns(
        mock do |mock_query|
          mock_query.expects(:find_each).multiple_yields(*mock_placeholders)
        end
      )
      CDO.log.expects(:info).with('2 placeholders filled.')

      e = assert_raises do
        DummyForm.fill_placeholders
      end

      assert e.message.include? 'Errors filling Pd::DummyForm placeholders:'
      assert e.message.include? "  Submission #{failed_submission_ids[0]}: Test error 1"
      assert e.message.include? "  Submission #{failed_submission_ids[1]}: Test error 2"
    end

    test 'placeholder sync_from_jotform updates answers from JotForm API' do
      placeholder = DummyForm.new placeholder_params

      JotForm::Translation.expects(:new).with(placeholder.form_id).returns(
        mock do |_mock_translation|
          expects(:get_submission).with(placeholder.submission_id).returns(
            {
              answers: FAKE_ANSWERS
            }
          )
        end
      )
      placeholder.expects(:update!).with(answers: FAKE_ANSWERS.to_json)

      placeholder.sync_from_jotform
    end

    test 'answers are checked against questions before validation' do
      form = DummyForm.new params_with_answers

      mock_processed_answers = mock
      DummyForm.expects(:get_questions).with(form.form_id).returns(
        mock do |_mock_survey_questions|
          expects(:process_answers).
            with(FAKE_ANSWERS, show_hidden_questions: true).
            returns(mock_processed_answers)
        end
      )

      form.validate
    end

    test 'form_data_hash checks answers against questions once then caches' do
      form = DummyForm.new params_with_answers

      mock_processed_answers = mock
      expect_get_and_process_answers(
        form_id: form.form_id, answers: FAKE_ANSWERS, processed_answers: mock_processed_answers
      )

      5.times do
        assert_equal mock_processed_answers, form.form_data_hash
      end
    end

    test 'reassigning answers clears form_data_hash cache' do
      form = DummyForm.new params_with_answers

      # initial query and cache (see above test case)
      mock_processed_answers = mock
      expect_get_and_process_answers(
        form_id: form.form_id, answers: FAKE_ANSWERS, processed_answers: mock_processed_answers
      )
      form.form_data_hash

      # reset answers, expect new query
      form.answers = FAKE_ANSWERS.to_json
      mock_processed_updated_answers = mock
      expect_get_and_process_answers(
        form_id: form.form_id, answers: FAKE_ANSWERS, processed_answers: mock_processed_updated_answers
      )
      assert_equal mock_processed_updated_answers, form.form_data_hash
    end

    test 'attribute_mapping is used to populate attributes before validation' do
      form = DummyFormWithAttributeMapping.new params_with_answers
      form.expects(:form_data_hash).returns(FAKE_ANSWERS)

      assert_nil form.custom_field
      form.validate
      assert_equal 'answer1', form.custom_field
    end

    test 'sync_from_jotform with no args syncs all forms' do
      all_form_ids = 2.times.map {get_form_id}
      DummyForm.expects(:all_form_ids).returns(all_form_ids)
      DummyForm.expects(:_sync_from_jotform).with(all_form_ids)

      DummyForm.sync_from_jotform
    end

    test 'sync_from_jotform with a form_id only syncs that form' do
      form_id = get_form_id
      DummyForm.expects(:all_form_ids).never
      DummyForm.expects(:_sync_from_jotform).with([form_id])

      DummyForm.sync_from_jotform form_id
    end

    test 'jotform sync gets questions syncs new answers for each form' do
      form_ids = 2.times.map {get_form_id}
      last_submission_id = get_submission_id
      min_date = Date.today
      form_ids.each do |form_id|
        DummyForm.expects(:get_min_date).with(form_id).returns(min_date)
        DummyForm.expects(:get_questions).with(form_id, force_sync: true).returns(
          mock do |_mock_questions|
            expects(:last_submission_id).returns(last_submission_id)
          end
        )
        JotForm::Translation.expects(:new).with(form_id).returns(
          mock do |_mock_translation|
            expects(:get_submissions).with(
              last_known_submission_id: last_submission_id,
              min_date: min_date,
              limit: 1000,
              offset: 0
            ).returns(
              {
                result_set: {count: 0},
                submissions: []
              }
            )
          end
        )
      end

      DummyForm._sync_from_jotform form_ids
    end

    test 'jotform sync retrieves and processes all new submissions in batches and updates last submission id' do
      form_id = get_form_id
      base_get_submissions_params = {
        last_known_submission_id: nil,
        min_date: nil,
        limit: 5
      }

      DummyForm.stubs(:sync_batch_size).returns(5)
      mock_questions = mock {expects(:last_submission_id).returns(nil)}
      DummyForm.expects(:get_questions).with(form_id, force_sync: true).returns(mock_questions)

      # 3 batches (batch limit == 5)
      mock_translations = [5, 5, 1].each_with_index.map do |result_count, i|
        mock_submissions = result_count.times.map do
          submission_id = get_submission_id
          mock_questions.expects(:update!).with(last_submission_id: submission_id)
          mock do |mock_submission|
            expects(:[]).with(:submission_id).returns(submission_id)
            DummyForm.expects(:process_submission).with(mock_submission).returns(true)
          end
        end
        mock do |_mock_translation|
          expects(:get_submissions).with(base_get_submissions_params.merge(offset: i * 5)).returns(
            {
              result_set: {count: result_count},
              submissions: mock_submissions
            }
          )
        end
      end
      JotForm::Translation.expects(:new).with(form_id).times(3).returns(*mock_translations)
      CDO.log.expects(:info).with('11 JotForm submissions imported in 3 batches.')

      DummyForm.sync_from_jotform form_id
    end

    test 'jotform sync collects errors and stops updating last submission id' do
      form_id = get_form_id

      mock_questions = mock {expects(:last_submission_id).returns(nil)}
      DummyForm.expects(:get_questions).with(form_id, force_sync: true).returns(mock_questions)

      generate_mock_submission = proc do |imported, error, expect_update_last_submission_id|
        submission_id = get_submission_id
        mock_questions.expects(:update!).with(last_submission_id: submission_id) if expect_update_last_submission_id
        mock do |mock_submission|
          expects(:[]).with(:submission_id).returns(submission_id)

          if error.present?
            DummyForm.expects(:process_submission).with(mock_submission).raises(error)
          else
            # process_submission returns nil for skipped submissions
            DummyForm.expects(:process_submission).with(mock_submission).returns(imported ? true : nil)
          end
        end
      end

      mock_submissions = [
        generate_mock_submission[true, nil, true], # imported # 1
        generate_mock_submission[false, nil, true], # skipped
        generate_mock_submission[true, nil, true], # imported # 2
        generate_mock_submission[false, 'Processing error 1', false], # error
        generate_mock_submission[true, nil, false], # imported #3, post error
      ]

      JotForm::Translation.expects(:new).with(form_id).returns(
        mock do |_mock_translation|
          expects(:get_submissions).with(
            last_known_submission_id: nil,
            min_date: nil,
            limit: 1000,
            offset: 0
          ).returns(
            {
              result_set: {count: mock_submissions.size},
              submissions: mock_submissions
            }
          )
        end
      )
      CDO.log.expects(:info).with('3 JotForm submissions imported in 1 batch.')

      e = assert_raises do
        DummyForm.sync_from_jotform form_id
      end
      assert e.message.include? "Error syncing JotForm submissions for forms [#{form_id}]. Errors:"
      assert e.message.include? "Processing error 1"
    end

    test 'jotform sync stops processing when an entire batch fails' do
      form_id = get_form_id
      DummyForm.stubs(:sync_batch_size).returns(2)
      DummyForm.expects(:get_questions).with(form_id, force_sync: true).returns(
        mock {expects(:last_submission_id).returns(nil)}
      )

      mock_submissions = 2.times.map do |i|
        submission_id = get_submission_id
        mock do |mock_submission|
          expects(:[]).with(:submission_id).returns(submission_id)
          DummyForm.expects(:process_submission).with(mock_submission).raises("Process error #{i}")
        end
      end

      JotForm::Translation.expects(:new).with(form_id).returns(
        mock do |_mock_translation|
          expects(:get_submissions).with(
            last_known_submission_id: nil,
            min_date: nil,
            limit: 2,
            offset: 0
          ).returns(
            {
              result_set: {count: 2},
              submissions: mock_submissions
            }
          )
        end
      )

      e = assert_raises do
        DummyForm.sync_from_jotform form_id
      end
      2.times.map do |i|
        assert e.message.include? "Process error #{i}"
      end
      assert e.message.include? 'Submission all: Entire batch failed. Aborting'
    end

    private

    def get_form_id
      @next_form_id = (@next_form_id || FORM_ID) + 1
    end

    def get_submission_id
      @next_submission_id = (@next_submission_id || SUBMISSION_ID) + 1
    end

    def generate_unique_key
      SecureRandom.hex(10)
    end

    def placeholder_params
      {
        form_id: get_form_id,
        unique_key: generate_unique_key,
        submission_id: get_submission_id
      }
    end

    def params_with_answers
      placeholder_params.merge(answers: FAKE_ANSWERS.to_json)
    end

    def expect_get_and_process_answers(form_id:, answers:, processed_answers:)
      DummyForm.expects(:get_questions).with(form_id).returns(
        mock do |_mock_survey_questions|
          expects(:process_answers).
            with(answers, show_hidden_questions: false).
            returns(processed_answers).once
        end
      ).once
    end
  end
end
