# == Schema Information
#
# Table name: parental_permission_requests
#
#  id             :bigint           not null, primary key
#  user_id        :integer          not null
#  parent_email   :string(255)      not null
#  uuid           :string(36)       not null
#  reminders_sent :integer          default(0), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_parental_permission_requests_on_user_id  (user_id)
#  index_parental_permission_requests_on_uuid     (uuid)
#
FactoryBot.define do
  factory :parental_permission_request do
  end
end
