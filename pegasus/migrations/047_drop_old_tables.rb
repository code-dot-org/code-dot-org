Sequel.migration do
  up do
    drop_table?(:countries)
    drop_table?(:cs_statistics)
    drop_table?(:donors)
    drop_table?(:events_whitelist)
    drop_table?(:homepage_teachers)
    drop_table?(:languages)
    drop_table?(:leaders)
    drop_table?(:news_items)
    drop_table?(:partners)
    drop_table?(:promote_tools)
    drop_table?(:quotes)
    drop_table?(:redirects)
    drop_table?(:states)
    drop_table?(:state_actions)
    drop_table?(:state_petitions)
    drop_table?(:team_members)
    drop_table?(:uk_quotes)
    drop_table?(:us_states)
    drop_table?(:youtube_videos)
    drop_table?(:zip_codes)
  end

  down do
  end
end
