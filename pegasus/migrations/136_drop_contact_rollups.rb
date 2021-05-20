Sequel.migration do
  up do
    # "Contact rollups" is a process that syncs emails we've collected to our marketing platform (Pardot).
    # The first version was built using a Pegasus table, which we've since deprecated.
    # We (as of April 2021) manage this process in Dashboard.
    # See this file (ContactRollupsV2) for more details:
    # https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/lib/contact_rollups_v2.rb
    drop_table(:contact_rollups)

    # This table was generated dynamically if you ran the contact rollups process
    # (ie, was never created by migration).
    # See deleted file here: https://github.com/code-dot-org/code-dot-org/blob/486fd1f360397cf4bfc9334828c5b640eeb390c8/lib/cdo/contact_rollups.rb#L331
    # Which was removed in this PR: https://github.com/code-dot-org/code-dot-org/pull/37901
    # Dropping this table conditionally on it existing, as it will only exist in environments where Contact Rollups V1
    # has been run.
    drop_table?(:contact_rollups_daily)
  end
end
