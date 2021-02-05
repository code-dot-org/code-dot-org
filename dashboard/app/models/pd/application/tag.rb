# == Schema Information
#
# Table name: pd_application_tags
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pd_application_tags_on_name  (name) UNIQUE
#

module Pd::Application
  class Tag < ApplicationRecord
    self.table_name = 'pd_application_tags'

    has_and_belongs_to_many :pd_applications, class_name: '::Pd::Application::ApplicationBase', foreign_key: 'pd_application_tag_id', association_foreign_key: 'pd_application_id'
  end
end
