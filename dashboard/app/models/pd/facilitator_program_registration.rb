# == Schema Information
#
# Table name: pd_facilitator_program_registrations
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null
#  form_data  :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  teachercon :integer
#
# Indexes
#
#  index_pd_fac_prog_reg_on_user_id_and_teachercon  (user_id,teachercon) UNIQUE
#

#
# DEPRECATED MODEL
# This model only exists as a historical record of registrations at past TeacherCon events,
# (which we will no longer hold going forward).  Associated routes and views have been removed.
# Archival and removal of this model is tracked in https://codedotorg.atlassian.net/browse/PLC-341
#
class Pd::FacilitatorProgramRegistration < ApplicationRecord
  include Pd::ProgramRegistrationForm

  TEACHERCON_DECLINE = 'No - I\'m no longer interested'.freeze
  TEACHERCON_ALTERNATE = 'No - but I need to attend a different date.'.freeze
  TRAINING_DECLINE = 'No'.freeze
  TRAINING_ALTERNATE = 'I want to participate in the program, but I\'m no longer able to attend these dates.'.freeze
  TRAINING_ALTERNATE_DECLINE = 'I am no longer interested in the Code.org Facilitator Development Program.'.freeze

  def self.required_fields
    [
      :address_street,
      :address_city,
      :address_state,
      :address_zip,
      :contact_name,
      :contact_relationship,
      :contact_phone,
      :dietary_needs,
      :live_far_away,
      :how_traveling,
      :need_hotel,
      :need_ada,
      :photo_release,
      :liability_waiver,
      :gender,
      :race,
      :age,
      :grades_taught,
      :grades_planning_to_teach,
      :subjects_taught,
    ].freeze
  end

  def self.options
    super.merge(
      {
        confirm_teachercon_date: [
          'Yes',
          TEACHERCON_ALTERNATE,
          TEACHERCON_DECLINE
        ],

        alternate_teachercon_date: [
          "TeacherCon 1: #{DATES[0]}",
          "TeacherCon 2: #{DATES[1]}",
          "TeacherCon 3: #{DATES[2]}"
        ],

        confirm_training_date: [
          'Yes',
          TRAINING_DECLINE
        ],

        decline_training_date: [
          TRAINING_ALTERNATE,
          TRAINING_ALTERNATE_DECLINE
        ],

        csd_alternate_training_date: [
          'July 22 - 23 (immediately following TeacherCon 2)',
          'August 5 - 6 (immediately following TeacherCon 3)'
        ],

        csp_alternate_training_date: [
          'June 24 - 25 (immediately following TeacherCon 1)',
          'July 22 - 23 (immediately following TeacherCon 2)',
          'August 5 - 6 (immediately following TeacherCon 3)'
        ]
      }
    ).freeze
  end

  # Returns whether the associated user has been deleted, returning false if the user does not
  # exist. Overrides Pd::Form#owner_deleted?.
  # @return [Boolean] Whether the associated user has been deleted.
  def owner_deleted?
    !!user.try(:deleted?)
  end

  def validate_required_fields
    return if owner_deleted?

    hash = sanitize_form_data_hash

    if hash.try(:[], :confirm_teachercon_date) == TEACHERCON_ALTERNATE
      add_key_error(:alternate_teachercon_date) unless hash.key?(:alternate_teachercon_date)
    end

    if hash.try(:[], :confirm_training_date) == TRAINING_DECLINE
      add_key_error(:decline_training_date) unless hash.key?(:decline_training_date)
    end

    if hash.try(:[], :decline_training_date) == TRAINING_ALTERNATE
      unless hash.key?(:csd_alternate_training_date) || hash.key?(:csp_alternate_training_date)
        add_key_error(:csd_alternate_training_date)
        add_key_error(:csp_alternate_training_date)
      end
    end

    if hash.try(:[], :confirm_teachercon_date) == TEACHERCON_DECLINE || hash.try(:[], :confirm_training_date) == TRAINING_DECLINE
      # then we don't really care about the rest of the fields
      return
    end

    super
  end

  def self.attendance_dates(user, teachercon)
    attendance = Pd::FacilitatorTeacherconAttendance.find_by(user: user)
    return unless attendance

    attendance.attendance_dates(teachercon)
  end

  def self.course(user, teachercon)
    attendance = Pd::FacilitatorTeacherconAttendance.find_by(user: user)
    return unless attendance

    attendance.course(teachercon)
  end
end
