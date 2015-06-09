class Workshop < ActiveRecord::Base
  PROGRAM_TYPES = %w(1 2 3 4 5)

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
end
