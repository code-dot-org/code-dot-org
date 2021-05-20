require 'test_helper'

module Pd::Foorm
  class FoormParserTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @daily_survey_day_0 = create :foorm_form_summer_pre_survey
      @daily_survey_day_5 = create :foorm_form_summer_post_survey
      @csf_survey = create :foorm_form_csf_intro_post_survey
    end

    teardown_all do
      @daily_survey_day_0.delete
      @daily_survey_day_5.delete
      @csf_survey.delete
    end

    test 'parses day 0 form correctly' do
      parsed_form = FoormParser.parse_forms([@daily_survey_day_0])
      expected_form = {
        general: {
          'surveys/pd/summer_workshop_pre_survey_test.0': {
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
        },
        facilitator: {}
      }
      assert_equal expected_form.with_indifferent_access, parsed_form.with_indifferent_access
    end

    test 'parses multiple forms without errors' do
      parsed_forms = FoormParser.parse_forms([@daily_survey_day_0, @daily_survey_day_5])

      assert_equal 2, parsed_forms[:general].keys.length
      assert_equal 'surveys/pd/summer_workshop_pre_survey_test.0', parsed_forms[:general].keys[0]
      assert_equal 'surveys/pd/summer_workshop_post_survey_test.0', parsed_forms[:general].keys[1]
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
      form_data =  parsed_form[:general]['sample.0']
      assert_equal expected_choice_1, form_data['question1']['choices']
      assert_equal expected_choice_2, form_data['question2']['choices']
      assert_equal expected_choice_3, form_data['question3']['choices']
    end

    test 'correctly parses form with facilitator panel' do
      parsed_form = FoormParser.parse_forms([@csf_survey]).with_indifferent_access

      facilitator_questions = parsed_form[:facilitator]['surveys/pd/workshop_csf_intro_post_test.0']
      assert_not_empty facilitator_questions
      assert_equal 'facilitator_effectiveness', facilitator_questions.keys[0]
      assert_equal 'k5_facilitator_did_well', facilitator_questions.keys[1]
    end
  end
end
