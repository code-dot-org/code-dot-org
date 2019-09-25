# == Schema Information
#
# Table name: queued_account_purges
#
#  id                :integer          not null, primary key
#  user_id           :integer          not null
#  reason_for_review :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_queued_account_purges_on_user_id  (user_id) UNIQUE
#

FactoryGirl.define do
  factory :queued_account_purge do
    user
    reason_for_review "Fake reason."

    trait :autoretryable do
      reason_for_review "Pardot::InvalidApiKeyException"
    end
  end
end
