# == Schema Information
#
# Table name: pd_regional_partner_contacts
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  regional_partner_id :integer
#  form_data           :text(65535)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_pd_regional_partner_contacts_on_regional_partner_id  (regional_partner_id)
#  index_pd_regional_partner_contacts_on_user_id              (user_id)
#

class Pd::RegionalPartnerContact < ActiveRecord::Base
  include Pd::Form

  def self.required_fields
    [
      :first_name,
      :last_name,
      :title,
      :email,
      :role,
      :job_title,
      :grade_levels,
      :notes
    ]
  end

  def self.options
    super.merge(
      {
        title: %w(Mr. Mrs. Ms. Dr.),
        role: ['Teacher', 'School Administrator', 'District Administrator'],
        gradeLevels: ['High School', 'Middle School', 'Elementary School']
      }
    )
  end
end
