# == Schema Information
#
# Table name: pd_teachercon1819_registrations
#
#  id                  :integer          not null, primary key
#  pd_application_id   :integer
#  form_data           :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  regional_partner_id :integer
#  user_id             :integer
#
# Indexes
#
#  index_pd_teachercon1819_registrations_on_pd_application_id    (pd_application_id)
#  index_pd_teachercon1819_registrations_on_regional_partner_id  (regional_partner_id)
#  index_pd_teachercon1819_registrations_on_user_id              (user_id)
#

require 'cdo/shared_constants/pd/teachercon1819_registration_constants'

class Pd::Teachercon1819Registration < ActiveRecord::Base
  include Pd::Form
  include Teachercon1819RegistrationConstants

  belongs_to :pd_application, class_name: 'Pd::Application::ApplicationBase'
  belongs_to :regional_partner, class_name: 'RegionalPartner'
  belongs_to :user

  YES = 'Yes'.freeze
  NO = 'No'.freeze
  YES_OR_NO = [YES, NO].freeze

  after_create :update_application_status
  def update_application_status
    return unless pd_application

    if waitlisted?
      pd_application.update!(status: "waitlisted")
    elsif declined?
      pd_application.update!(status: "withdrawn")
    end
  end

  after_create :send_teachercon_confirmation_email
  def send_teachercon_confirmation_email
    if regional_partner_id?
      Pd::Teachercon1819RegistrationMailer.regional_partner(self).deliver_now
    elsif pd_application_id?
      return unless pd_application.try(:workshop) && pd_application.workshop.teachercon?
      Pd::Teachercon1819RegistrationMailer.send(pd_application.application_type.downcase, self).deliver_now
    else
      Pd::Teachercon1819RegistrationMailer.lead_facilitator(self).deliver_now
    end
  end

  def self.options
    {
      dietary_needs: [
        'None',
        'Vegetarian',
        'Vegan',
        'Kosher',
        'Halal',
        'Gluten Free',
        TEXT_FIELDS[:food_allergy],
      ],
      live_far_away: YES_OR_NO,
      address_state: get_all_states_with_dc.to_h.values,
      how_traveling: [
        'I will drive by myself',
        'I will carpool with another TeacherCon attendee (Please note who):',
        'Flying',
        'Amtrak or regional train service',
        'Public transit (e.g., city bus or light rail)',
      ],
      need_hotel: YES_OR_NO,
      need_ada: YES_OR_NO,
      able_to_attend: YES_OR_NO,
      teacher_accept_seat: [
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:accept],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_date],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_other],
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:decline],
      ],
      how_offer_csp: [
        "As an AP course",
        "As a non-AP course",
        "Both: I will teach multiple sections, some as AP and some as non-AP",
        "I'm not sure",
      ],
      have_taught_ap: [
        YES, NO,
        "I'm not sure",
      ],
      have_taught_written_project_course: [
        YES, NO,
        "I'm not sure",
      ],
      grading_system: [
        'Numerical and/or letter grades (e.g., 0 - 100% or F- A)',
        'Rank-based grading (distribute grades based on student rank)',
        'Standards-based grading (grades assigned based on exceeding, meeting, or falling below the standard)',
        TEXT_FIELDS[:other_please_list]
      ],
      how_many_hours: [
        "At least 100 course hours",
        "50 to 99 course hours",
        "Less than 50 course hours",
        "I'm not sure",
      ],
      how_many_terms: [
        "1 quarter",
        "1 trimester",
        "1 semester",
        "2 trimesters",
        "Full year",
        "I'm not sure",
      ],
      travel_covered: [
        "Code.org is covering my trip",
        "I am covering my trip"
      ]
    }.freeze
  end

  def self.required_fields
    [
      :preferred_first_name,
      :last_name,
      :email,
      :phone,
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

    if pd_application && pd_application.application_type === "Teacher"
      requireds.concat [
        :teacher_accept_seat,
        :how_many_hours,
        :how_many_terms,
        :grading_system
      ]

      if pd_application.course === "csp"
        requireds.concat [
          :how_offer_csp,
          :have_taught_ap,
          :have_taught_written_project_course,
        ]
      end
    else
      requireds.concat [
        :able_to_attend
      ]
    end

    # some fields are required based on the values of other fields

    if hash[:live_far_away] == YES && !regional_partner_id?
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

    if hash[:dietary_needs].try(:include?, 'Food Allergy')
      requireds.concat [
        :dietary_needs_details
      ]
    end

    if pd_application
      requireds.concat [
        :agree_share_contact
      ]
    end

    if regional_partner_id?
      requireds.concat [
        :travel_covered
      ]
    end

    return requireds
  end

  def accepted?
    accept_status ==
      if pd_application.try(:application_type) == 'Teacher'
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:accept]
      else
        YES
      end
  end

  def waitlisted?
    accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_date] ||
      accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_other]
  end

  def declined?
    accept_status ==
      if pd_application.try(:application_type) == 'Teacher'
        TEACHER_SEAT_ACCEPTANCE_OPTIONS[:decline]
      else
        NO
      end
  end

  # Simplified string representing whether the registrant accepted the teachercon seat
  def accepted_seat_simplified
    if accepted?
      'Yes'
    elsif accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_date]
      'Yes, but I have a conflict'
    elsif accept_status == TEACHER_SEAT_ACCEPTANCE_OPTIONS[:waitlist_other]
      "Yes, but I can't for another reason"
    else
      'No'
    end
  end

  def accept_status
    if pd_application.try(:application_type) == "Teacher"
      sanitize_form_data_hash.try(:[], :teacher_accept_seat)
    elsif pd_application.try(:application_type) == "Facilitator" || pd_application.nil?
      sanitize_form_data_hash.try(:[], :able_to_attend)
    end
  end

  def date_accepted
    pd_application.try(&:date_accepted) || created_at.to_date.iso8601
  end

  def applicant_name
    hash = sanitize_form_data_hash
    "#{hash[:preferred_first_name]} #{hash[:last_name]}"
  end

  def email
    user.try(:email) || sanitize_form_data_hash[:email]
  end

  def regional_partner_name
    regional_partner.try(:name)
  end

  def course_name
    pd_application.try(&:course_name)
  end
end
