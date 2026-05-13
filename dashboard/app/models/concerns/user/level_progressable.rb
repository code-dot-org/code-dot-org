# This concern adds progression-tracking methods to the User model for navigating scripted curriculum.
module User::LevelProgressable
  extend ActiveSupport::Concern

  # Returns the next visible script_level for the next progression level in the
  # given script that hasn't yet been passed, starting at the last level the
  # user most recently submitted.
  def next_unpassed_visible_progression_level(script)
    # If all levels in the script are complete, no need to find the next level,
    # will be redirected to /congrats.
    return nil if Policies::ScriptActivity.completed?(self, script)

    visible_sls = visible_script_levels(script).reject {|sl| sl.bonus || sl.level.unplugged? || sl.locked?(self)}

    sl_level_ids = visible_sls.map(&:level_ids).flatten

    # Levels the user made progress in
    ul_level_ids = user_levels_by_level(script).keys

    visible_completed_level_ids = sl_level_ids & ul_level_ids
    visible_incomplete_level_ids = sl_level_ids - ul_level_ids

    first_visible_level = visible_sls.min_by(&:chapter)

    completed_all_visible_levels = visible_incomplete_level_ids.empty?

    # Find the user_levels associated with visible script_levels
    visible_user_levels = user_levels.where(level_id: visible_completed_level_ids)

    # The user has not made any visible progress or has completed all visible
    # levels but not the entire script, return the first visible script_level
    return first_visible_level if visible_user_levels.empty? || completed_all_visible_levels

    # Most recently completed user_level of the visible subset
    most_recent_ul = visible_user_levels.max_by(&:created_at)

    # Find the script_level that goes with the most recent user_level
    most_recent_sl = visible_sls.find {|sl| sl.level_id == most_recent_ul.level_id}

    last_visible_level = visible_sls.max_by(&:chapter)

    visible_incomplete_sls = visible_sls.find_all {|sl| visible_incomplete_level_ids.include?(sl.level_id)}

    first_visible_incomplete_level = visible_incomplete_sls.min_by(&:chapter)

    # The user has completed the last level in the progression, but not all
    # previous levels, return the first visible incomplete script_level
    return first_visible_incomplete_level || first_visible_level if
      (most_recent_sl == last_visible_level) || most_recent_sl.nil?

    # Find the chapter for the script_level that goes with the most recent user_level
    most_recent_completed_chapter = most_recent_sl.chapter

    # Find the script_level that has the next highest chapter level from the one above and is not complete
    later_unpassed_visible_sls = visible_incomplete_sls.select do |sl|
      sl.chapter > most_recent_completed_chapter
    end

    next_unpassed_visible_progression_sl = later_unpassed_visible_sls.min_by(&:chapter)

    next_unpassed_visible_progression_sl
  end

  # Returns the next script_level for the next progression level in the given
  # script that hasn't yet been passed, starting its search at the last level we submitted.
  def next_unpassed_progression_level(script)
    # some of our user_levels may be for levels within level_groups, or for levels
    # that are no longer in this script. we want to ignore those, and only look
    # user_levels that have matching script_levels
    # Worth noting in the case that we have the same level appear in
    # the script in multiple places (i.e. via level swapping) there's some potential
    # for strange behavior.
    sl_level_ids = script.script_levels.map(&:level_ids).flatten
    ul_with_sl = user_levels_by_level(script).select do |level_id, _ul|
      sl_level_ids.include? level_id
    end

    # Find the user_level that we've most recently had progress on
    user_level = ul_with_sl.values.max_by(&:updated_at)

    script_level_index = 0
    if user_level
      last_script_level = user_level.script_level
      script_level_index = last_script_level.chapter - 1 if last_script_level
    end

    next_unpassed = script.script_levels[script_level_index..].try(:detect) do |script_level|
      user_levels = script_level.level_ids.map {|id| ul_with_sl[id]}
      unpassed_progression_level?(script_level, user_levels)
    end

    # if we don't have any unpassed levels proceeding the one we've most recently
    # submitted, just go to the one we've most recently submitted
    next_unpassed || last_script_level
  end

  # Returns true if all progression levels in the provided script have a passing
  # result.
  def completed_progression_levels?(script)
    num_unpassed_progression_levels(script) == 0
  end

  def num_unpassed_progression_levels(script)
    user_levels_by_level = user_levels_by_level(script)

    script.script_levels.count do |script_level|
      user_levels = []
      script_level.levels.each do |level|
        curr_user_level = user_levels_by_level[level.id]

        # If level.id is not present in user_levels_by_level, check if level has contained_levels with present ids
        if !curr_user_level && !level.contained_levels.empty? && level.type != "BubbleChoice"
          level.contained_levels.each do |contained_level|
            user_levels.push(user_levels_by_level[contained_level.id])
          end
        else
          user_levels.push(curr_user_level)
        end
      end
      unpassed_progression_level?(script_level, user_levels)
    end
  end

  # Return true if script_level is a valid_progression_level and every
  # user_level is either missing or not passing.
  def unpassed_progression_level?(script_level, user_levels)
    script_level.valid_progression_level? && user_levels.all? do |user_level|
      !(user_level && user_level.passing?)
    end
  end

  # Is the provided script_level hidden, on account of the section(s) that this
  # user is enrolled in
  def script_level_hidden?(script_level)
    return false if script_level.script.can_be_instructor?(self)

    sections = sections_as_student
    return false if sections.empty?

    script_sections = sections.select {|s| s.script.try(:id) == script_level.script.id}

    if script_sections.empty?
      # if we have no sections matching this script id, we consider a lesson hidden if any of the sections we're in
      # hide it
      sections.any? {|s| script_level.hidden_for_section?(s.id)}
    else
      # if we have one or more sections matching this script id, we consider a lesson hidden if all of those sections
      # hides the lesson
      script_sections.all? {|s| script_level.hidden_for_section?(s.id)}
    end
  end

  def visible_script_levels(script)
    script.script_levels.select do |sl|
      !script_level_hidden?(sl)
    end
  end
end
