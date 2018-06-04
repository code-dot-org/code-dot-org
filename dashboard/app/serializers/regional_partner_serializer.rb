# == Schema Information
#
# Table name: regional_partners
#
#  id                 :integer          not null, primary key
#  name               :string(255)      not null
#  group              :integer
#  contact_id         :integer
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
# Indexes
#
#  index_regional_partners_on_name_and_contact_id  (name,contact_id) UNIQUE
#

class RegionalPartnerSerializer < ActiveModel::Serializer
  include Pd::Application::RegionalPartnerTeacherconMapping
  include Pd::SharedWorkshopConstants

  attributes :id, :name, :group, :workshop_type

  def workshop_type
    get_matching_teachercon(object) ? WORKSHOP_TYPES[:teachercon] : WORKSHOP_TYPES[:local_summer]
  end
end
