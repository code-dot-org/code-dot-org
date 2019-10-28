require 'test_helper'

module Pd::SurveyPipeline
  class SurveyPipelineHelperTest2 < ActiveSupport::TestCase
    include Pd::SurveyPipeline::Helper

    test 'report_rollups for workshop with submissions' do
      create_complete_ayw

      f1 = @workshop.facilitators.first
      f2 = @workshop.facilitators.second

      facilitator_averages = {
        "facilitator_effectiveness_1494688268261028618" => 1.0,
        "facilitator_effectiveness_6627891197594983630" => 4.0,
        "facilitator_effectiveness_8015784983354522873" => 3.0,
        "facilitator_effectiveness_16129913079128962044" => 1.0,
        "facilitator_effectiveness" => 2.25
      }

      workshop_averages = {
        "overall_success_2136245491560413670" => 6.0,
        "overall_success_9121793211174253549" => 7.0,
        "overall_success_5502876428019550646" => 6.0,
        "overall_success_3964718812856239438" => 6.0,
        "overall_success_6174705123632039779" => 7.0,
        "teacher_engagement_8809902359007963123" => 7.0,
        "teacher_engagement_12316562461560038168" => 6.0,
        "teacher_engagement_8566597854585674670" => 6.0,
        "teacher_engagement_12383077849665641424" => 7.0,
        "overall_success" => 6.4,
        "teacher_engagement" => 6.5
      }

      expected_report = {
        facilitator_rollups: {
          rollups: {
            "facilitator_#{f1.id}_single_ws" => {
              averages: facilitator_averages,
              response_count: 1,
              facilitator_id: f1.id,
              workshop_id: @workshop.id,
            },
            "facilitator_#{f1.id}_all_ws" => {
              averages: facilitator_averages,
              response_count: 1,
              facilitator_id: f1.id,
              all_workshop_ids: [@workshop.id],
              course_name: @workshop.course
            },
            "facilitator_#{f2.id}_single_ws" => {
              averages: facilitator_averages,
              response_count: 1,
              facilitator_id: f2.id,
              workshop_id: @workshop.id,
            },
            "facilitator_#{f2.id}_all_ws" => {
              averages: facilitator_averages,
              response_count: 1,
              facilitator_id: f2.id,
              all_workshop_ids: [@workshop.id],
              course_name: @workshop.course
            },
          },
          questions: {
            "facilitator_effectiveness_1494688268261028618" =>  "During my workshop, {facilitatorName} did the following: -> Demonstrated knowledge of the curriculum.",
            "facilitator_effectiveness_9145365597108923713" => "During my workshop, {facilitatorName} did the following: -> Built and sustained an equitable learning environment in our workshop.",
            "facilitator_effectiveness_6627891197594983630" => "During my workshop, {facilitatorName} did the following: -> Kept the workshop and participants on track.",
            "facilitator_effectiveness_10623511283632440781" => "During my workshop, {facilitatorName} did the following: -> Supported productive workshop discussions.",
            "facilitator_effectiveness_8015784983354522873" => "During my workshop, {facilitatorName} did the following: -> Helped me see ways to create and support an equitable learning environment for my students.",
            "facilitator_effectiveness_16129913079128962044" => "During my workshop, {facilitatorName} did the following: -> Demonstrated a healthy working relationship with their co-facilitator (if applicable).",
          },
          facilitators: {f1.id => f1.name, f2.id => f2.name},
        },
        workshop_rollups: {
          rollups: {
            "single_ws" => {
              averages: workshop_averages,
              response_count: 1,
              workshop_id: @workshop.id,
            },
            "facilitator_#{f1.id}_all_ws" => {
              averages: workshop_averages,
              response_count: 1,
              facilitator_id: f1.id,
              all_workshop_ids: [@workshop.id],
              course_name: @workshop.course
            },
            "facilitator_#{f2.id}_all_ws" => {
              averages: workshop_averages,
              response_count: 1,
              facilitator_id: f2.id,
              all_workshop_ids: [@workshop.id],
              course_name: @workshop.course
            }
          },
          questions: {
            "overall_success_2136245491560413670" => "How much do you agree or disagree with the following statements about the workshop overall? -> I feel more prepared to teach the material covered in this workshop than before I came.",
            "overall_success_9121793211174253549" => "How much do you agree or disagree with the following statements about the workshop overall? -> I know where to go if I need help preparing to teach this material.",
            "overall_success_5502876428019550646" => "How much do you agree or disagree with the following statements about the workshop overall? -> This professional development was suitable for my level of experience with teaching CS.",
            "overall_success_3964718812856239438" => "How much do you agree or disagree with the following statements about the workshop overall? -> I feel connected to a community of computer science teachers.",
            "overall_success_6174705123632039779" => "How much do you agree or disagree with the following statements about the workshop overall? -> I would recommend this professional development to others",
            "teacher_engagement_8809902359007963123" => "How much do you agree or disagree with the following statements about your level of engagement in the workshop? -> I found the activities we did in this workshop interesting and engaging.",
            "teacher_engagement_12316562461560038168" => "How much do you agree or disagree with the following statements about your level of engagement in the workshop? -> I was highly active and participated a lot in the workshop activities.",
            "teacher_engagement_8566597854585674670" => "How much do you agree or disagree with the following statements about your level of engagement in the workshop? -> When I'm not in Code.org workshops, I frequently talk about ideas or content from the workshop with others.",
            "teacher_engagement_12383077849665641424" => "How much do you agree or disagree with the following statements about your level of engagement in the workshop? -> I am definitely planning to make use of ideas and content covered in this workshop in my classroom."
          },
          facilitators: {f1.id => f1.name, f2.id => f2.name},
        }
      }

      report = report_rollups @workshop, @admin
      assert_equal expected_report, report
    end

    private

    FORM_IDS = [
      CSF201_PRE = '90066184161150'.to_i,
      CSF201_POST = '90065524560150'.to_i,
      CSF201_FAC = '91405279991164'.to_i,
      AYW_1 = '92125650301142'.to_i,
      AYW_2 = '92125614667157'.to_i,
      AYW_3 = '92125413150141'.to_i,
      AYW_4 = '92125122319145'.to_i,
      AYW_POST = '92125916725157'.to_i,
      K12_FAC = '91372090131144'.to_i
    ]

    def create_complete_ayw
      ws = create :csp_academic_year_workshop
      facilitators = ws.facilitators

      # daily survey
      create :pd_workshop_daily_survey, pd_workshop: ws, day: 1, form_id: AYW_1, answers: create_default_answer(AYW_1)

      # post survey
      create :pd_workshop_daily_survey, pd_workshop: ws, day: ws.sessions.count, form_id: AYW_POST, answers: create_default_answer(AYW_POST)

      # facilitator-specific surveys
      ws.sessions.each_with_index do |ss, i|
        facilitators.each do |f|
          create :pd_workshop_facilitator_daily_survey, pd_session: ss, day: i + 1, form_id: K12_FAC, facilitator: f, answers: create_default_answer(K12_FAC)
        end
      end

      @workshop = ws
      @admin = create :workshop_admin
    end

    def create_default_answer(form_id)
      # These answers are for real questions in Pd::SurveyQuestion.find(form_id)
      # May need to sync Pd::SurveyQuestion first.
      answers =
        case form_id
        when CSF201_PRE then
          {
            5 => 'no barrier',
            57 => 'great hope',
            23 => {'create sections of students on the Code.org website.' => '7'},
          }
        when CSF201_POST then
          {
            33 => 'No, I don\'t think so.',
            75 => 'no detraction',
            # overall_success
            70 => {'I know where to go if I need help preparing to teach this material.' => 'Strongly agree'},
          }
        when CSF201_FAC then
          {
            18 => {'Demonstrated knowledge of the curriculum.' => 'Neutral'} # facilitator_effectiveness
          }
        when AYW_1 then
          {
            22 => 'B',
            # 24 => {"row 1"=>"", "row 2"=>"Strongly Agree", "row 3"=>""},
            29 => {
              "I would like to know where to find all the Code.org course materials and resources I need." => "6",
              "I am concerned about the amount of time needed to cover all the material." => "",
              "I am concerned about my own computer science content knowledge." => "2",
              "I would like to develop working relationships with other teachers who are teaching this course." => "7",
              "I am concerned about my inability to manage all that teaching this course requires." => "6"
            },
          }
        when AYW_POST then
          {
            16 => "Yes, I give the workshop organizer permission to quote me, but I want to be anonymous.",
            19 => "i learn a lot",
            # overall_success
            17 => {
              "I feel more prepared to teach the material covered in this workshop than before I came." => "Agree",
              "I know where to go if I need help preparing to teach this material." => "Strongly Agree",
              "This professional development was suitable for my level of experience with teaching CS." => "Agree",
              "I feel connected to a community of computer science teachers." => "Agree",
              "I would recommend this professional development to others" => "Strongly Agree",
            },
            # teacher_engagement
            18 => {
              "I found the activities we did in this workshop interesting and engaging." => "Strongly Agree",
              "I was highly active and participated a lot in the workshop activities." => "Agree",
              "When I'm not in Code.org workshops, I frequently talk about ideas or content from the workshop with others." => "Agree",
              "I am definitely planning to make use of ideas and content covered in this workshop in my classroom." => "Strongly Agree",
            },
            22 => "food is good",
          }
        when K12_FAC then
          {
            # facilitator_effectiveness
            60 => {
              "Demonstrated knowledge of the curriculum." => "Strongly Disagree",
              "Built and sustained an equitable learning environment in our workshop." => "",
              "Kept the workshop and participants on track." => "Neutral",
              "Supported productive workshop discussions." => "",
              "Helped me see ways to create and support an equitable learning environment for my students." => "Slightly Disagree",
              "Demonstrated a healthy working relationship with their co-facilitator (if applicable)." => "Strongly Disagree"
            },
          }
        else
          raise "Do not have default answer for #{form_id}"
        end
      answers.to_json
    end
  end
end
