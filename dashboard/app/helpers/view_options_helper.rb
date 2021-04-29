module ViewOptionsHelper
  AppViewOptions = Struct.new(
    :full_width, # The container for the main page content should span the full width of the screen.
    :no_padding_container, # The container for the main page content should have no padding/margins
    :no_header,
    :no_footer,
    :small_footer,
    :code_studio_logo,
    :has_i18n,
    :white_background,
    :callouts,
    :autoplay_video,
    :channel,
    :readonly_workspace,
    :is_external_project_level,
    :is_legacy_share,
    :legacy_share_style,
    :is_challenge_level,
    :post_milestone_mode,
    :is_bonus_level,
    :puzzle_ratings_url,
    :authored_hint_view_requests_url,
    :authored_hints_used_ids,
    :server_level_id,
    :server_project_level_id,
    :game_display_name,
    :script_name,
    :lesson_position,
    :level_position,
    :public_caching,
    :is_13_plus,
    :user_id,
    :has_contained_levels,
    :next_level_url,
    :responsive_content, # The container for the main page content will be responsive to small screen sizes.
    :answerdash,
    :signed_replay_log_url,
    :azure_speech_service_voices,
    :authenticity_token,
    :useGoogleBlockly,
    :disallowed_html_tags
  )
  # Sets custom options to be used by the view layer. The option hash is frozen once read.
  def view_options(opts = nil)
    @view_options ||= AppViewOptions.new
    if opts.blank?
      @view_options.freeze.to_h.compact
    else
      opts.each {|k, v| @view_options[k] = v}
    end
  end

  # Reset view options (for test code)
  def reset_view_options
    @view_options = nil
  end

  LevelViewOptions = Struct.new(
    :success_condition,
    :start_blocks,
    :toolbox_blocks,
    :edit_blocks,
    :skip_instructions_popup,
    :embed,
    :share,
    :hide_source,
    :submitted,
    :unsubmit_url,
    :iframe_embed,
    :iframe_embed_app_and_code,
    :pairing_driver,
    :pairing_attempt,
    :pairing_channel_id,
    :project_type
  )
  # Sets custom level options to be used by the view layer. The option hash is
  # frozen once read. Accepts a level_id argument. If an option isn't naturally
  # associated with a specific level, it should probably go into view_options.
  def level_view_options(level_id, opts = nil)
    @level_view_options_map ||= {}
    level_view_options = @level_view_options_map[level_id] ||= LevelViewOptions.new
    if opts.blank?
      level_view_options.freeze.to_h.compact
    else
      opts.each {|k, v| level_view_options[k] = v}
    end
  end
end
