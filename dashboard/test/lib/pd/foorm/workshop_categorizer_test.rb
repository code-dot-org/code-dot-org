require 'test_helper'

module Pd::Foorm
  class WorkshopCategorizerTest < ActiveSupport::TestCase
    test 'initialize_categories creates correct structure' do
      form_categories = [:implementation, :engagement, :logistics, :facilitators, :other]
      categories = WorkshopCategorizer.initialize_categories(form_categories)

      expected_categories = [:implementation, :engagement, :logistics, :facilitators, :other]
      assert_equal expected_categories.sort, categories.keys.sort

      # All categories except facilitators should have questions array
      [:implementation, :engagement, :logistics, :other].each do |category|
        assert categories[category].key?(:questions)
        assert_equal({}, categories[category][:questions])
      end

      # Facilitators should be empty hash (will be populated with facilitator data)
      assert_equal({}, categories[:facilitators])
    end

    test 'determine_category handles valid categories correctly' do
      assert_equal :implementation, WorkshopCategorizer.determine_category('implementation')
      assert_equal :engagement, WorkshopCategorizer.determine_category('engagement')
      assert_equal :logistics, WorkshopCategorizer.determine_category('logistics')
      assert_equal :facilitators, WorkshopCategorizer.determine_category('facilitators')
      assert_equal :other, WorkshopCategorizer.determine_category('other')
    end

    test 'determine_category handles case insensitive input' do
      assert_equal :implementation, WorkshopCategorizer.determine_category('IMPLEMENTATION')
      assert_equal :engagement, WorkshopCategorizer.determine_category('Engagement')
      assert_equal :logistics, WorkshopCategorizer.determine_category('LOGISTICS')
    end

    test 'determine_category handles dynamic categories' do
      # Any string category should be converted to symbol
      assert_equal :custom_category, WorkshopCategorizer.determine_category('custom_category')
    end

    test 'promoter_percentage_scale? correctly identifies Promoter percentage vs Likert scales' do
      # Promoter percentage scale: 0-10
      promoter_percentage_question = {rate_min: 0, rate_max: 10}
      assert WorkshopCategorizer.promoter_percentage_scale?(promoter_percentage_question)

      # Likert scale: 1-7 (explicit)
      likert_question = {rate_min: 1, rate_max: 7}
      refute WorkshopCategorizer.promoter_percentage_scale?(likert_question)

      # Likert scale: rate_max only (rate_min defaults to 1)
      likert_question_default = {rate_max: 7}
      refute WorkshopCategorizer.promoter_percentage_scale?(likert_question_default)

      # Other scales
      other_scale = {rate_min: 1, rate_max: 5}
      refute WorkshopCategorizer.promoter_percentage_scale?(other_scale)

      # Missing data (should default to 1-7)
      empty_question = {}
      refute WorkshopCategorizer.promoter_percentage_scale?(empty_question)
    end

    test 'find_form_summary_in_answers locates correct form data' do
      summarized_answers = {
        'Survey 1' => {
          general: {
            'form_key_1' => {'question1' => 'data1'},
            'form_key_2' => {'question2' => 'data2'}
          },
          facilitator: {
            'form_key_3' => {'question3' => 'data3'}
          }
        },
        'Survey 2' => {
          general: {
            'form_key_4' => {'question4' => 'data4'}
          }
        }
      }

      # Test finding general form
      result = WorkshopCategorizer.find_form_summary_in_answers(summarized_answers, 'form_key_1', :general)
      assert_equal({'question1' => 'data1'}, result)

      # Test finding facilitator form
      result = WorkshopCategorizer.find_form_summary_in_answers(summarized_answers, 'form_key_3', :facilitator)
      assert_equal({'question3' => 'data3'}, result)

      # Test form not found
      result = WorkshopCategorizer.find_form_summary_in_answers(summarized_answers, 'nonexistent', :general)
      assert_nil result
    end

    test 'create_processed_question handles single select questions' do
      question_name = 'test_question'
      question_data = {
        title: 'Test Question',
        short_text: 'Test Short',
        type: 'singleSelect',
        category: 'implementation',
        choices: {'option1' => 'Option 1', 'option2' => 'Option 2'}
      }
      question_summary = {'option1' => 3, 'option2' => 2}

      result = WorkshopCategorizer.create_processed_question(question_name, question_data, question_summary)

      assert_equal 'test_question', result[:question_name]
      assert_equal 'Test Question', result[:question_text]
      assert_equal 'Test Short', result[:question_short_text]
      assert_equal 'singleSelect', result[:question_type]
      assert_equal 'implementation', result[:category]
      assert result[:results].key?(:total_responses)
      assert_equal 5, result[:results][:total_responses]
    end

    test 'create_processed_question handles promoter scale questions' do
      question_name = 'promoter_percentage_question'
      question_data = {
        title: 'How likely are you to recommend?',
        type: 'scale',
        category: 'engagement',
        rate_min: 0,
        rate_max: 10,
        choices: {'7' => '7', '8' => '8', '9' => '9', '10' => '10'}
      }
      question_summary = {'7' => 1, '8' => 1, '9' => 1, '10' => 1}

      result = WorkshopCategorizer.create_processed_question(question_name, question_data, question_summary)

      assert_equal 'promoter', result[:question_type]
      assert result[:results].key?(:promoter_percentage)
      assert_equal 100, result[:results][:promoter_percentage] # All responses >= 7
    end

    test 'create_processed_question handles Likert scale questions' do
      question_name = 'likert_question'
      question_data = {
        title: 'How much do you agree?',
        type: 'scale',
        category: 'implementation',
        rate_max: 7,  # No rate_min defined, should default to 1
        choices: {'5' => 'Slightly Agree', '6' => 'Agree', '7' => 'Strongly Agree'}
      }
      question_summary = {'5' => 1, '6' => 2, '7' => 1}

      result = WorkshopCategorizer.create_processed_question(question_name, question_data, question_summary)

      assert_equal 'likert', result[:question_type]
      assert result[:results].key?(:weighted_score)
      assert result[:results].key?(:total_responses)
      assert result[:results].key?(:agreement_count)
      assert result[:results].key?(:agreement_percentage)
      # All responses are >= 5, so 100% agreement
      assert_equal 100, result[:results][:agreement_percentage]
    end

    test 'create_processed_question handles facilitator name replacement' do
      question_name = 'facilitator_question'
      question_data = {
        title: '{panel.facilitator_name} was effective',
        short_text: '{panel.facilitator_name} effectiveness',
        type: 'singleSelect',
        category: 'facilitators',
        choices: {'yes' => 'Yes', 'no' => 'No'}
      }
      question_summary = {'yes' => 3, 'no' => 1}
      facilitator_name = 'John Smith'

      result = WorkshopCategorizer.create_processed_question(question_name, question_data, question_summary, facilitator_name)

      assert_equal 'John Smith was effective', result[:question_text]
      assert_equal 'John Smith effectiveness', result[:question_short_text]
    end

    test 'categorize_survey_data processes questions into correct categories' do
      # Mock parsed forms with categories
      parsed_forms_with_categories = {
        general: {
          'form1' => {
            'impl_question' => {
              title: 'Implementation Question',
              type: 'singleSelect',
              category: 'implementation',
              choices: {'yes' => 'Yes', 'no' => 'No'}
            },
            'engage_question' => {
              title: 'Engagement Question',
              type: 'singleSelect',
              category: 'engagement',
              choices: {'high' => 'High', 'low' => 'Low'}
            },
            'log_question' => {
              title: 'Logistics Question',
              type: 'singleSelect',
              category: 'logistics',
              choices: {'high' => 'High', 'low' => 'Low'}
            },
            'other_question' => {
              title: 'Other Question',
              type: 'singleSelect',
              category: 'other',
              choices: {'1' => 'Strongly Disagree', '7' => 'Strongly Agree'}
            }
          }
        },
        facilitator: {}
      }

      # Mock summarized answers
      summarized_answers = {
        'Survey1' => {
          general: {
            'form1' => {
              'impl_question' => {'yes' => 8, 'no' => 2},
              'engage_question' => {'high' => 6, 'low' => 4},
              'log_question' => {'high' => 7, 'low' => 3},
              'other_question' => {'1' => 4, '7' => 10}
            }
          }
        }
      }

      facilitators = nil

      result = WorkshopCategorizer.categorize_survey_data(parsed_forms_with_categories, summarized_answers, facilitators)

      # Check structure
      assert result.key?(:implementation)
      assert result.key?(:engagement)
      assert result.key?(:logistics)
      assert result.key?(:facilitators)
      assert result.key?(:other)

      # Check implementation category has the right question
      impl_questions = result[:implementation][:questions]
      assert_equal 1, impl_questions.length
      assert_equal 'impl_question', impl_questions['impl_question'][:question_name]
      assert_equal 'Implementation Question', impl_questions['impl_question'][:question_text]

      # Check engagement category has the right question
      engage_questions = result[:engagement][:questions]
      assert_equal 1, engage_questions.length
      assert_equal 'engage_question', engage_questions['engage_question'][:question_name]
      assert_equal 'Engagement Question', engage_questions['engage_question'][:question_text]

      # Check logistics category has the right question
      engage_questions = result[:logistics][:questions]
      assert_equal 1, engage_questions.length
      assert_equal 'log_question', engage_questions['log_question'][:question_name]
      assert_equal 'Logistics Question', engage_questions['log_question'][:question_text]

      # Check other category has the right question
      other_questions = result[:other][:questions]
      assert_equal 1, other_questions.length
      assert_equal 'other_question', other_questions['other_question'][:question_name]
      assert_equal 'Other Question', other_questions['other_question'][:question_text]

      # Facilitators categories should be empty
      assert_equal({}, result[:facilitators])
    end

    test 'categorize_survey_data handles matrix questions by splitting rows' do
      # Mock matrix question with different row categories
      parsed_forms_with_categories = {
        general: {
          'form1' => {
            'matrix_question' => {
              title: 'Matrix Question',
              type: 'matrix',
              original_type: 'matrix',
              columns: {'1' => 'Disagree', '7' => 'Agree'},
              matrix_rows: {
                'row1' => {
                  text: 'Implementation Row',
                  category: 'implementation'
                },
                'row2' => {
                  text: 'Engagement Row',
                  category: 'engagement'
                }
              }
            }
          }
        },
        facilitator: {}
      }

      summarized_answers = {
        'Survey1' => {
          general: {
            'form1' => {
              'matrix_question' => {
                'row1' => {'1' => 2, '7' => 8},
                'row2' => {'1' => 3, '7' => 7}
              }
            }
          }
        }
      }

      result = WorkshopCategorizer.categorize_survey_data(parsed_forms_with_categories, summarized_answers, nil)

      # Each matrix row should be processed as separate question in its category
      impl_questions = result[:implementation][:questions]
      assert_equal 1, impl_questions.length
      assert_equal 'row1', impl_questions['row1'][:question_name]
      assert_equal 'Implementation Row', impl_questions['row1'][:question_text]

      engage_questions = result[:engagement][:questions]
      assert_equal 1, engage_questions.length
      assert_equal 'row2', engage_questions['row2'][:question_name]
      assert_equal 'Engagement Row', engage_questions['row2'][:question_text]
    end

    test 'categorize_survey_data handles facilitator questions' do
      facilitators = {
        'fac1' => 'John Smith',
        'fac2' => 'Jane Doe'
      }

      parsed_forms_with_categories = {
        general: {},
        facilitator: {
          'fac_form' => {
            'fac_question' => {
              title: '{panel.facilitator_name} was helpful',
              type: 'singleSelect',
              category: 'facilitators',
              choices: {'yes' => 'Yes', 'no' => 'No'}
            }
          }
        }
      }

      summarized_answers = {
        'Survey1' => {
          facilitator: {
            'fac_form' => {
              'fac_question' => {
                'fac1' => {'yes' => 5, 'no' => 1},
                'fac2' => {'yes' => 4, 'no' => 2}
              }
            }
          }
        }
      }

      result = WorkshopCategorizer.categorize_survey_data(parsed_forms_with_categories, summarized_answers, facilitators)

      # Check facilitator structure
      assert result[:facilitators].key?('fac1')
      assert result[:facilitators].key?('fac2')
      assert_equal 'John Smith', result[:facilitators]['fac1'][:name]
      assert_equal 'Jane Doe', result[:facilitators]['fac2'][:name]

      # Check questions with name replacement
      fac1_questions = result[:facilitators]['fac1'][:questions]
      assert_equal 1, fac1_questions.length
      assert_equal 'John Smith was helpful', fac1_questions['fac_question'][:question_text]

      fac2_questions = result[:facilitators]['fac2'][:questions]
      assert_equal 1, fac2_questions.length
      assert_equal 'Jane Doe was helpful', fac2_questions['fac_question'][:question_text]
    end
  end
end
