# == Schema Information
#
# Table name: pd_application_tags
#
#  id   :integer          not null, primary key
#  name :string(255)      not null
#
# Indexes
#
#  index_pd_application_tags_on_name  (name)
#

module Pd::Application
  class Tag < ActiveRecord::Base
    self.table_name = 'pd_application_tags'
  end
end
