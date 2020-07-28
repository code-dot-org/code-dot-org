ActiveRecord::Base.transaction do
  # mark all poste_urls that haven't been clicked in the last 2 months as deleted_at = now

  # This script is a dry-run unless we comment out this last line
  raise ActiveRecord::Rollback.new, "Intentional rollback"
end
