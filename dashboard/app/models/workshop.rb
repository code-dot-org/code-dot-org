class Workshop < ActiveRecord::Base
  PROGRAM_TYPES = %w(MSS, MSM, ECS, CSP)

  validates_inclusion_of :program_type, in: PROGRAM_TYPES, on: :create
  # A Workshop has multiple well defined Time Segments (eg. each morning/afternoon of a workshop is a separate time segment)
  has_many :segments, dependent: :destroy

  has_many :attendances, through: :segments

  # A Workshop is associated with a Cohort
  belongs_to :cohort

  # A Workshop has a Facilitator(s)
  belongs_to :facilitator, class_name: 'User'
end
