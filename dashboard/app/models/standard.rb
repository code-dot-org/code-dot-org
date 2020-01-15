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

class Standard < ActiveRecord::Base
end
