# Sanity check used by bin/cron/update_project_count before it saves a new
# standalone project count.
module ProjectCountCheck
  SIGNIFICANT_DECREASE = 10_000

  # Raises if the standalone project count went down by more than
  # SIGNIFICANT_DECREASE. Only enforced in production: other environments (e.g.
  # test) get their databases reset, so a drop there is expected and the new
  # count should simply become the baseline.
  def self.verify!(existing_count, new_count, production:)
    return unless production
    if (existing_count - new_count) >= SIGNIFICANT_DECREASE
      raise "standalone project count decreased from #{existing_count} to #{new_count}"
    end
  end
end
