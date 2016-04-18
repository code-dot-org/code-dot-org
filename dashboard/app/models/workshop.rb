# == Schema Information
#
# Table name: workshops
#
#  id           :integer          not null, primary key
#  name         :string(255)
#  program_type :string(255)      not null
#  location     :string(1000)
#  instructions :string(1000)
#  created_at   :datetime
#  updated_at   :datetime
#  phase        :integer
#
# Indexes
#
#  index_workshops_on_name          (name)
#  index_workshops_on_program_type  (program_type)
#

require 'cdo/workshop_constants'

class Workshop < ActiveRecord::Base
  PROGRAM_TYPES = %w(1 2 3 4 5 6)

  validates_inclusion_of :program_type, in: PROGRAM_TYPES, on: :create
  # A Workshop has multiple well defined Time Segments (eg. each morning/afternoon of a workshop is a separate time segment)
  has_many :segments, -> {order :start}, dependent: :destroy

  has_many :attendances, through: :segments

  has_many :teachers, through: :cohorts, class_name: 'User'

  has_and_belongs_to_many :unexpected_teachers,
                          class_name: 'User',
                          association_foreign_key: 'unexpected_teacher_id',
                          join_table: 'unexpected_teachers_workshops'

  # A Workshop is associated with one or more Cohorts
  has_many :workshop_cohorts, inverse_of: :workshop, dependent: :destroy
  has_many :cohorts, through: :workshop_cohorts
  has_many :districts, through: :cohorts
  has_many :district_contacts, through: :districts, :source => :contact
  accepts_nested_attributes_for :workshop_cohorts, allow_destroy: true

  # A Workshop has at least one Facilitator(s)
  has_and_belongs_to_many :facilitators,
                          class_name: 'User',
                          association_foreign_key: 'facilitator_id',
                          join_table: 'facilitators_workshops'

  def self.ending_today
    Workshop.joins(:segments).group(:workshop_id).having("(DATE(MAX(start)) = ?)", Date.today)
  end

  def self.in_2_weeks
    Workshop.joins(:segments).group(:workshop_id).having("(DATE(MIN(start)) = DATE_ADD(?, INTERVAL 2 WEEK))", Date.today)
  end

  def self.in_3_days
    Workshop.joins(:segments).group(:workshop_id).having("DATE(MIN(start)) = (DATE_ADD(?, INTERVAL 3 DAY))", Date.today)
  end

  def phase_info
    WorkshopConstants::PHASES[self.phase.to_i]
  end

  def program_type_info
    WorkshopConstants::PROGRAM_TYPES[self.program_type.to_i]
  end

  def exit_survey_url
    program_ids = WorkshopConstants::EXIT_SURVEY_IDS[program_type_short_name]
    return nil unless program_ids
    survey_id = program_ids[phase_short_name]
    return nil unless survey_id
    "https://docs.google.com/a/code.org/forms/d/#{survey_id}/viewform"
  end

  def phase_short_name
    return nil unless phase_info
    phase_info[:short_name]
  end

  def program_type_short_name
    return nil unless program_type_info
    program_type_info[:short_name]
  end

  def phase_long_name
    return nil unless phase_info
    phase_info[:long_name]
  end

  def prerequisite_phase
    return nil unless phase_info
    WorkshopConstants::PHASES[phase_info[:prerequisite_phase]]
  end

  def automated_email_recipients
    (teachers + unexpected_teachers + facilitators + district_contacts).uniq
  end

  def send_reminders
    automated_email_recipients.each do |recipient|
      next unless EmailValidator.email_address?(recipient.email)
      logger.debug("Sending email reminder to #{recipient.email}")
      OpsMailer.workshop_reminder(self, recipient).deliver_now
    end
  end

  def self.send_2_week_reminders
    in_2_weeks.each(&:send_reminders)
  end

  def self.send_3_day_reminders
    in_3_days.each(&:send_reminders)
  end

  def send_exit_surveys
    automated_email_recipients.each do |recipient|
      next unless EmailValidator.email_address?(recipient.email)
      logger.debug("Sending exit survey info to #{recipient.email}")
      OpsMailer.exit_survey_information(self, recipient).deliver_now
    end
  end

  def self.send_exit_surveys
    ending_today.each(&:send_exit_surveys)
  end

  def self.send_automated_emails
    send_2_week_reminders
    send_3_day_reminders
    send_exit_surveys
  end

end
