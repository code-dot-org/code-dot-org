class Workshop < ActiveRecord::Base
  PROGRAM_TYPES = %w(1 2 3 4)

  validates_inclusion_of :program_type, in: PROGRAM_TYPES, on: :create
  # A Workshop has multiple well defined Time Segments (eg. each morning/afternoon of a workshop is a separate time segment)
  has_many :segments, dependent: :destroy

  has_many :attendances, through: :segments

  has_many :teachers, through: :cohort, class_name: 'User'

  # A Workshop is associated with a Cohort
  belongs_to :cohort
  has_many :districts, through: :cohort

  # A Workshop has at least one Facilitator(s)
  has_and_belongs_to_many :facilitators,
                          class_name: 'User',
                          association_foreign_key: 'facilitator_id',
                          join_table: 'facilitators_workshops'
end
