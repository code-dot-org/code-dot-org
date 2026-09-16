class StudentLoginBadgeEvent < ApplicationRecord
  validates :operation, inclusion: {in: %w[issue replace renew revoke print login]}
end
