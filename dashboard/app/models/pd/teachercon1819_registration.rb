# == Schema Information
#
# Table name: pd_teachercon1819_registrations
#
#  id                :integer          not null, primary key
#  pd_application_id :integer
#  form_data         :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_pd_teachercon1819_registrations_on_pd_application_id  (pd_application_id)
#

require 'cdo/shared_constants/pd/teachercon1819_registration_constants'

class Pd::Teachercon1819Registration < ActiveRecord::Base
  include Pd::Form
  include Teachercon1819RegistrationConstants

  belongs_to :pd_application, class_name: 'Pd::Application::ApplicationBase'

  YES = 'Yes'.freeze
  NO = 'No'.freeze
  YES_OR_NO = [YES, NO].freeze

  after_create :update_application_status
  def update_application_status
    if waitlisted?
      pd_application.update!(status: "waitlisted")
    elsif declined?
      pd_application.update!(status: "withdrawn")
    end
  end

  after_create :send_teachercon_confirmation_email
  def send_teachercon_confirmation_email
    return unless pd_application.workshop && pd_application.workshop.teachercon?

    Pd::Teachercon1819RegistrationMailer.confirmation(self).deliver_now
  end

  def self.options
    {
      dietaryNeeds: [
        'None',
        'Vegetarian',
        'Vegan',
        'Halal',
        'Gluten Free',
        TEXT_FIELDS[:food_allergy],
      ],
      liveFarAway: YES_OR_NO,
      addressState: get_all_states_with_dc.to_h.values,
      howTraveling: [
        'I will drive by myself',
        'I will carpool with another TeacherCon attendee',
        'Flying',
        'Amtrak or regional train service',
        'Public transit (e.g., city bus or light rail)',
      ],
      needHotel: YES_OR_NO,
      needAda: [YES, NO, TEXT_FIELDS[:other_please_explain]],
      ableToAttend: YES_OR_NO,
      teacherAcceptSeat: [
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:accept],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_date],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_other],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:decline],
      ],
      howOfferCsp: [
        "As an AP course",
        "As a non-AP course",
        "Both: I will teach multiple sections, some as AP and some as non-AP",
        "I'm not sure",
      ],
      haveTaughtAp: [
        YES, NO,
        "I'm not sure",
      ],
      haveTaughtWrittenProjectCourse: [
        YES, NO,
        "I'm not sure",
      ],
      gradingSystem: [
        'Numerical and/or letter grades (e.g., 0 - 100% or F- A)',
        'Rank-based grading (distribute grades based on student rank)',
        'Standards-based grading (grades assigned based on exceeding, meeting, or falling below the standard)',
        TEXT_FIELDS[:other_please_list]
      ],
      howManyHours: [
        "At least 100 course hours",
        "50 to 99 course hours",
        "Less than 50 course hours",
        "I'm not sure",
      ],
      howManyTerms: [
        "1 quarter",
        "1 trimester",
        "1 semester",
        "2 trimesters",
        "Full year",
        "I'm not sure",
      ],
      photoRelease: [YES],
      liabilityWaiver: [YES],
    }.freeze
  end

  def self.required_fields
    [
      :preferred_first_name,
      :last_name,
      :email,
      :phone,
      :teacher_accept_seat,
      :contact_first_name,
      :contact_last_name,
      :contact_relationship,
      :contact_phone,
      :dietary_needs,
      :live_far_away,
      :how_traveling,
      :need_hotel,
      :photo_release,
      :liability_waiver,
      :agree_share_contact,
    ].freeze
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    if hash.try(:[], :teacher_accept_seat) == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:decline]
      # then we don't care about the rest of the fields
      return
    end

    if hash.try(:[], :able_to_attend) == NO
      # then we don't care about the rest of the fields
      return
    end

    super
  end

  def dynamic_required_fields(hash)
    requireds = []

    # some fields are required based on the type of the associated application

    if pd_application.application_type === "Teacher"
      requireds.concat [
        :teacher_accept_seat
      ]

      if pd_application.course === "csp"
        requireds.concat [
          :how_offer_csp,
          :have_taught_ap,
          :have_taught_written_project_course,
          :grading_system,
        ]
      elsif pd_application.course === "csd"
        requireds.concat [
          :how_many_hours,
          :how_many_terms,
        ]
      end
    else
      requireds.concat [
        :able_to_attend
      ]
    end

    # some fields are required based on the values of other fields

    if hash[:live_far_away] == YES
      requireds.concat [
        :address_street,
        :address_city,
        :address_state,
        :address_zip
      ]
    end

    if hash[:need_hotel] == YES
      requireds.concat [
        :need_ada
      ]
    end

    return requireds
  end

  def accepted?
    accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:accept]
  end

  def waitlisted?
    accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_date] ||
      accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_other]
  end

  def declined?
    accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:decline]
  end

  def accept_status
    sanitize_form_data_hash.try(:[], :teacher_accept_seat)
  end
end
