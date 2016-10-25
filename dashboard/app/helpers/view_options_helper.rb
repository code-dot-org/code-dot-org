module ViewOptionsHelper
  AppViewOptions = Struct.new(*%i(
    full_width
    no_header
    no_footer
    small_footer
    code_studio_logo
    has_i18n
    white_background
    callouts
    autoplay_video
    channel
    readonly_workspace
    is_external_project_level
    is_channel_backed
    is_legacy_share
    post_milestone
    post_final_milestone
    puzzle_ratings_url
    authored_hint_view_requests_url
    server_level_id
    game_display_name
    script_name
    stage_position
    level_position
    public_caching
    is_13_plus
    has_contained_levels
  ))
  # Sets custom options to be used by the view layer. The option hash is frozen once read.
  def view_options(opts = nil)
    @view_options ||= AppViewOptions.new
    if opts.blank?
      @view_options.freeze.to_h.delete_if { |_k, v| v.nil? }
    else
      opts.each{|k, v| @view_options[k] = v}
    end
  end

  # Reset view options (for test code)
  def reset_view_options
    @view_options = nil
  end

  LevelViewOptions = Struct.new(*%i(
    success_condition
    start_blocks
    toolbox_blocks
    edit_blocks
    skip_instructions_popup
    embed
    share
    hide_source
    submitted
    unsubmit_url
    iframe_embed
    pairing_driver
  ))
  # Sets custom level options to be used by the view layer. The option hash is
  # frozen once read. Accepts a level_id argument. If an option isn't naturally
  # associated with a specific level, it should probably go into view_options.
  def level_view_options(level_id, opts = nil)
    @level_view_options_map ||= {}
    level_view_options = @level_view_options_map[level_id] ||= LevelViewOptions.new
    if opts.blank?
      level_view_options.freeze.to_h.delete_if { |_k, v| v.nil? }
    else
      opts.each{|k, v| level_view_options[k] = v}
    end
  end
end
