# == Schema Information
#
# Table name: standards
#
#  id              :integer          not null, primary key
#  organization    :string(255)      not null
#  organization_id :string(255)      not null
#  description     :text(65535)
#  concept         :text(65535)
#
# Indexes
#
#  index_standards_on_organization_and_organization_id  (organization,organization_id) UNIQUE
#

class Standard < ActiveRecord::Base
  has_and_belongs_to_many :stages
end
