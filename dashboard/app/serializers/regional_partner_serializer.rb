# == Schema Information
#
# Table name: regional_partners
#
#  id                 :integer          not null, primary key
#  name               :string(255)      not null
#  group              :integer
#  urban              :boolean
#  attention          :string(255)
#  street             :string(255)
#  apartment_or_suite :string(255)
#  city               :string(255)
#  state              :string(255)
#  zip_code           :string(255)
#  phone_number       :string(255)
#  notes              :text(65535)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  deleted_at         :datetime
#  properties         :text(65535)
#

class RegionalPartnerSerializer < ActiveModel::Serializer
  include Pd::SharedWorkshopConstants
  attributes :id, :name, :group, :workshop_type

  def workshop_type
    WORKSHOP_TYPES[:local_summer]
  end
end
