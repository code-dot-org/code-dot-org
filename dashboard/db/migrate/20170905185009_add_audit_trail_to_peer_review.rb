class AddAuditTrailToPeerReview < ActiveRecord::Migration[5.0]
  def change
    add_column :peer_reviews, :audit_trail, :text, comment:
      'Human-readable (never machine-parsed) audit trail of assignments and '\
      'status changes with timestamps for the life of the peer review.'
  end
end
