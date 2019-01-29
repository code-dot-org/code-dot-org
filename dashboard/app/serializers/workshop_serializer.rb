# == Schema Information
#
# Table name: workshops
#
#  id             :integer          not null, primary key
#  name           :string(255)
#  program_type   :string(255)      not null
#  location       :string(1000)
#  instructions   :string(1000)
#  created_at     :datetime
#  updated_at     :datetime
#  phase          :integer
#  pd_workshop_id :integer
#
# Indexes
#
#  index_workshops_on_name            (name)
#  index_workshops_on_pd_workshop_id  (pd_workshop_id)
#  index_workshops_on_program_type    (program_type)
#

class WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type, :location, :instructions, :phase
  has_many :cohorts
  has_many :facilitators, serializer: UserSerializer
  has_many :segments
end
