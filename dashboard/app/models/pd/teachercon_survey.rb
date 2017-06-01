# == Schema Information
#
# Table name: pd_teachercon_surveys
#
#  id               :integer          not null, primary key
#  pd_enrollment_id :integer          not null
#  form_data        :text(65535)      not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_pd_teachercon_surveys_on_pd_enrollment_id  (pd_enrollment_id) UNIQUE
#

class Pd::TeacherconSurvey < ActiveRecord::Base
  include Pd::FacilitatorSpecificForm

  belongs_to :pd_enrollment, class_name: "Pd::Enrollment"
  validates_presence_of :pd_enrollment

  STRONGLY_DISAGREE_TO_STRONGLY_AGREE = [
    'Strongly Disagree',
    'Disagree',
    'Slightly Disagree',
    'Slightly Agree',
    'Agree',
    'Strongly Agree'
  ].freeze

  def required_fields
    [
      :personal_learning_needs_met,
      :have_ideas_about_formative,
      :have_ideas_about_summative,
      :have_concrete_ideas,
      :tools_will_help,
      :learned_enough_to_move_forward,
      :feel_confident_using_materials,
      :feel_confident_can_help_students,
      :have_plan,
      :feel_comfortable_leading,
      :have_less_anxiety,

      :what_helped_most,
      :what_detracted,

      :venue_feedback,
      :received_clear_communication,
      :know_where_to_go_for_help,
      :suitable_for_my_experience,
      :practicing_teaching_helped,
      :seeing_others_teach_helped,
      :facilitators_presented_information_clearly,
      :facilitators_provided_feedback,
      :felt_comfortable_asking_questions,
      :more_prepared_than_before,
      :look_forward_to_continuing,
      :all_students_should_take,
      :would_recommend,
      :best_pd_ever,
      :part_of_community,
      :how_much_participated,
      :how_often_lost_track_of_time,
      :how_excited_before,
      :how_happy_after,
      :facilitators_did_well,
      :facilitators_could_improve,
      :liked_most,
      :would_change,
      :give_permission_to_quote,
    ].freeze
  end

  def facilitator_required_fields
    [
      :things_facilitator_did_well,
      :things_facilitator_could_improve
    ].freeze
  end

  def get_facilitator_names
    pd_enrollment ? pd_enrollment.workshop.facilitators.map(&:name) : []
  end

  def self.options
    {
      personal_learning_needs_met: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      have_ideas_about_formative: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      have_ideas_about_summative: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      have_concrete_ideas: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      tools_will_help: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      learned_enough_to_move_forward: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      feel_confident_using_materials: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      feel_confident_can_help_students: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      have_plan: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      feel_comfortable_leading: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      have_less_anxiety: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,

      received_clear_communication: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      know_where_to_go_for_help: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      suitable_for_my_experience: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      practicing_teaching_helped: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      seeing_others_teach_helped: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      facilitators_presented_information_clearly: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      facilitators_provided_feedback: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      felt_comfortable_asking_questions: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      more_prepared_than_before: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      part_of_community: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      look_forward_to_continuing: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      all_students_should_take: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      would_recommend: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,
      best_pd_ever: STRONGLY_DISAGREE_TO_STRONGLY_AGREE,

      how_much_participated: [
        'Not at all',
        'A little bit',
        'Some',
        'Quite a bit',
        'A tremendous amount'
      ],

      how_often_lost_track_of_time: [
        'Almost never',
        'Once in a while',
        'Sometimes',
        'Often',
        'Almost always'
      ],

      how_excited_before: [
        'Not at all excited',
        'A little bit excited',
        'Somewhat excited',
        'Quite excited',
        'Extremely excited'
      ],

      how_happy_after: [
        'Not at all happy',
        'A little bit happy',
        'Somewhat happy',
        'Quite happy',
        'Extremely happy',
      ],

      give_permission_to_quote: [
        "Yes, I give Code.org permission to quote me and use my name.",
        "Yes, I give Code.org permission to quote me,  but I want to be anonymous. (Your name will not be used.)",
        "No, I do not give Code.org my permission.",
      ],

    }.freeze
  end
end
