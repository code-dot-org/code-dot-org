# == Schema Information
#
# Table name: cap_user_events
#
#  id           :bigint           not null, primary key
#  name         :string(64)       not null
#  user_id      :integer          not null
#  policy       :string(16)       not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  state_before :string(1)
#  state_after  :string(1)
#
# Indexes
#
#  index_cap_user_events_on_name_and_policy  (name,policy)
#  index_cap_user_events_on_policy           (policy)
#  index_cap_user_events_on_user_id          (user_id)
#
module CAP
  class UserEvent < ApplicationRecord
    POLICIES = Policies::ChildAccount.state_policies.each_value.map {|policy| policy[:name]}.freeze

    NAMES = [
      PARENT_EMAIL_SUBMIT = 'parent_email_submit'.freeze,
      PARENT_EMAIL_UPDATE = 'parent_email_update'.freeze,
      PERMISSION_GRANTING = 'permission_granting'.freeze,
      ACCOUNT_LOCKING = 'account_locking'.freeze,
      ACCOUNT_PURGING = 'account_purging'.freeze,
    ].freeze

    enum policy: POLICIES.index_by(&:underscore), _suffix: true
    enum name: NAMES.index_by(&:underscore)

    belongs_to :user

    validates :name, presence: true
    validates :policy, presence: true

    before_save :ensure_state_is_set

    private def ensure_state_is_set
      self.state_before ||= user.child_account_compliance_state
      self.state_after ||= user.child_account_compliance_state
    end
  end
end
