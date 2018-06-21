# == Schema Information
#
# Table name: pd_international_optins
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  form_data  :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pd_international_optins_on_user_id  (user_id)
#

FactoryGirl.define do
  factory :pd_international_optin, class: 'Pd::InternationalOptin' do
  end
end
