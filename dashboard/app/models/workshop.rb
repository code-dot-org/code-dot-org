# == Schema Information
#
# Table name: workshops
#
#  id           :integer          not null, primary key
#  name         :string(255)
#  program_type :string(255)      not null
#  location     :string(255)
#  instructions :string(255)
#  created_at   :datetime
#  updated_at   :datetime
#  phase        :text(65535)
#
# Indexes
#
#  index_workshops_on_name          (name)
#  index_workshops_on_program_type  (program_type)
#

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
  accepts_nested_attributes_for :workshop_cohorts, allow_destroy: true

  # A Workshop has at least one Facilitator(s)
  has_and_belongs_to_many :facilitators,
                          class_name: 'User',
                          association_foreign_key: 'facilitator_id',
                          join_table: 'facilitators_workshops'

  def self.workshops_ending_today
    Workshop.joins(:segments).group(:workshop_id).having("(DATE(MAX(start)) = ?)", Date.today)
  end

  def self.workshops_in_2_weeks
    Workshop.joins(:segments).group(:workshop_id).having("(DATE(MIN(start)) = DATE_ADD(?, INTERVAL 2 WEEK))", Date.today)
  end

  def self.workshops_in_3_days
    Workshop.joins(:segments).group(:workshop_id).having("DATE(MIN(start)) = (DATE_ADD(?, INTERVAL 3 DAY))", Date.today)
  end

  def phase_info
    ActivityConstants::PHASES[self.phase]
  end

  def program_type_info
    ActivityConstants::PHASES[self.program_type.to_i]
  end

  def self.send_automated_emails
    [Workshop.workshops_in_2_weeks, Workshop.workshops_in_3_days, Workshop.workshops_ending_today].each do |workshop_list|
      workshop_list.each do |workshop|
        teachers = Workshop.find(workshop[:id]).teachers
        drop_ins = Workshop.find(workshop[:id]).unexpected_teachers
        facilitators = Workshop.find(workshop[:id]).facilitators
        [teachers, drop_ins, facilitators].each do |recipient_list|
          recipient_list.each do |recipient|
            if workshop.segments.first.start.to_date == Date.today
              logger.debug("Sending exit survey info to #{recipient.email}")
              OpsMailer.exit_survey_information(workshop, recipient).deliver_now
            else
              logger.debug("Sending email reminder to #{recipient.email}")
              OpsMailer.workshop_reminder(workshop, recipient).deliver_now
            end
          end
        end
      end
    end
  end
end
