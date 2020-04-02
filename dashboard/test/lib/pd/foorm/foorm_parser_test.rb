require 'test_helper'

module Pd::Foorm
  class FoormParserTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @daily_survey_day_0 = ::Foorm::Form.find_by_name('surveys/pd/workshop_daily_survey_day_0')
      @daily_survey_day_5 = ::Foorm::Form.find_by_name('surveys/pd/workshop_daily_survey_day_5')
    end

    test 'parses day 0 form correctly' do
      parsed_form = FoormParser.parse_forms([@daily_survey_day_0])
      expected_form = {
        'surveys/pd/workshop_daily_survey_day_0.0': {
          course_length_weeks: {
            title: "For a typical section of {workshop_course} that you will teach, approximately how many WEEKS will the class run?",
            type: "singleSelect",
            choices: {
              '5_fewer': "5 or fewer",
              '6_10': "6 - 10",
              '11_15': "11 - 15",
              '16_20': "16 - 20",
              '21_30': "21 - 30",
              '30_more': "30 or more (full year)"
            }
          },
          teaching_cs_matrix: {
            title: "How much do you agree or disagree with the following statements about teaching computer science? ",
            type: "matrix",
            rows: {
              committed_to_teaching_cs: "I am committed to teaching computer science.",
              like_teaching_cs: "I like, or think I will like, teaching computer science.",
              understand_cs: "I understand computer science concepts well enough to be an effective teacher of computer science.",
              skills_cs: "I have the skills necessary to be an effective teacher of computer science. "
            },
            columns: {
              '1': "Strongly Disagree",
              '2': "Disagree ",
              '3': "Slightly Disagree ",
              '4': "Neutral ",
              '5': "Slightly Agree ",
              '6': "Agree ",
              '7': "Strongly Agree "
            }
          },
          expertise_rating: {
            title: "Lead Learner. 1. model expertise in how to learn  --- 5. need deep content expertise",
            type: "scale",
            choices: {
              '1': "1 - Strongly aligned with A",
              '2': "2",
              '3': "3",
              '4': "4",
              '5': "5 - Strongly aligned with B"
            }
          },
          birth_year: {
            title: "What is your year of birth? ",
            type: "text"
          },
          racial_ethnic_identity: {
            title: "What is your racial or ethnic identity? [check all that apply] ",
            type: "multiSelect",
            choices: {
              am_indian_alaska: "American Indian/Alaska Native",
              asian: "Asian",
              black_aa: "Black or African American",
              hispanic_latino: "Hispanic or Latino",
              native_hawaiin_pi: "Native Hawaiian or other Pacific Islander",
              white: "White",
              other: "Other",
              no_answer: "Prefer not to answer"
            }
          }
        }
      }
      assert_equal expected_form.with_indifferent_access, parsed_form.with_indifferent_access
    end

    test 'parses multiple forms without errors' do
      parsed_forms = FoormParser.parse_forms([@daily_survey_day_0, @daily_survey_day_5])

      assert_equal 2, parsed_forms.keys.length
      assert_equal 'surveys/pd/workshop_daily_survey_day_0.0', parsed_forms.keys[0]
      assert_equal 'surveys/pd/workshop_daily_survey_day_5.0', parsed_forms.keys[1]
    end

    test 'parses panel questions correctly' do
      panel_form_data = {
        pages: [
          name: 'sample',
          elements: [
            {
              type: "checkbox",
              name: "question1",
              choices: [{
                value: "item1",
                text: "Item1"
              }]
            },
            {
              type: "panel",
              name: "panel1",
              elements: [
                {
                  type: "radiogroup",
                  name: "question2",
                  choices: [{
                    value: "item2",
                    text: "Item2"
                  }]
                },
                {
                  type: "panel",
                  name: "panel2",
                  elements: [
                    {
                      type: "radiogroup",
                      name: "question3",
                      choices: [{
                        value: "item3",
                        text: "Item3"
                      }]
                    }
                  ]
                }
              ]
            }
          ]
        ]
      }.to_json
      form = Foorm::Form.create(name: 'sample', version: 0, questions: panel_form_data)
      parsed_form = FoormParser.parse_forms([form]).with_indifferent_access

      expected_choice_1 = {"item1" => "Item1"}
      expected_choice_2 = {"item2" => "Item2"}
      expected_choice_3 = {"item3" => "Item3"}
      assert_equal expected_choice_1, parsed_form['sample.0']['question1']['choices']
      assert_equal expected_choice_2, parsed_form['sample.0']['question2']['choices']
      assert_equal expected_choice_3, parsed_form['sample.0']['question3']['choices']
    end
  end
end
