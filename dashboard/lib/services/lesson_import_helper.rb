# Helper module for importing data from curriculumbuilder
module Services::LessonImportHelper
  # Lockable lessons don't need to be merged with curriculumbuilder, but we do
  # need the levels to be part of an activity section.
  def self.update_lockable_lesson(script_levels, lesson_id)
    [create_activity_with_levels(script_levels, lesson_id, 1)]
  end

  def self.create_activity_sections(activity_markdown)
    tip_matches = find_tips(activity_markdown).select {|m| m[1] != 'say'}.map {|m| {index: activity_markdown.index(m[0]), type: 'tip', match: m, substring: m[0]}}
    tip_link_matches = find_tip_links(activity_markdown).map {|m| {index: activity_markdown.index(m[0]), type: 'tiplink', match: m, substring: m[0]}}
    remark_matches = find_remarks(activity_markdown).map {|m| {index: activity_markdown.index(m[0]), type: 'remark', match: m, substring: m[0]}}
    skippable_matches = find_skippable_syntax(activity_markdown).map {|m| {index: activity_markdown.index(m[0]), type: 'skippable', match: m, substring: m[0]}}
    slide_matches = find_slides(activity_markdown).map {|m| {index: activity_markdown.index(m[0]), type: 'slide', match: m, substring: m[0]}}
    matches = tip_matches + remark_matches + tip_link_matches + skippable_matches + slide_matches
    sorted_matches = matches.sort_by {|m| m[:index]}
    return [ActivitySection.new(description: activity_markdown.strip, seeding_key: SecureRandom.uuid, position: 1)] if matches.empty?
    sorted_matches = find_markdown_chunks(activity_markdown, sorted_matches)
    sections = []
    tip_match_map = {}
    slide = false
    tip_matches.each do |match|
      key = match[:match][3] || "#{match[:match][1]}-0"
      tip_match_map[key] = match
    end
    position = 1
    sorted_matches.each do |match|
      activity_section = nil
      if match[:type] == 'skippable' || match[:type] == 'tip'
        next
      elsif match[:type] == 'slide'
        # For now, if we find the slide token, apply it to the next thing
        slide = true
        next
      elsif match[:type] == 'tiplink'
        activity_section = create_activity_section_with_tip(match[:match], tip_match_map)
      elsif match[:type] == 'remark'
        activity_section = create_activity_section_with_remark(match[:match])
      else
        activity_section = ActivitySection.new(description: match[:substring].strip)
      end
      next unless activity_section
      activity_section.position = position
      position += 1
      activity_section.slide = slide
      slide = false
      activity_section.seeding_key ||= SecureRandom.uuid
      sections = sections.push(activity_section)
    end
    tip_match_map.each do |key, value|
      match = value[:match]
      activity_section = ActivitySection.new
      activity_section.position = sections.length + 1
      activity_section.seeding_key ||= SecureRandom.uuid
      activity_section.tips = [create_tip(key, match[1] || "tip", match[4] || "no markdown found")]
      sections.push(activity_section)
    end
    sections
  end

  def self.create_lesson_activities(activities_data, levels, lesson_id)
    activities = activities_data.map.with_index(1) do |a, i|
      @lesson_activity = LessonActivity.new
      @lesson_activity.name = a['name']
      @lesson_activity.duration = a['duration'].split[0].to_i
      @lesson_activity.lesson_id = lesson_id
      @lesson_activity.seeding_key = SecureRandom.uuid
      @lesson_activity.position = i
      @lesson_activity.save!
      @lesson_activity.reload
      @lesson_activity.activity_sections = create_activity_sections(a['content'])
      @lesson_activity
    end

    # Create a lesson with all the levels in them
    # TODO use the [code-studio] syntax from CB instead
    unless levels.empty?
      activities.push(create_activity_with_levels(levels, lesson_id, activities.length + 1))
    end
    activities.flatten
  end

  # https://github.com/code-dot-org/curriculumbuilder/blob/57cad8f62e50b03e4f16bf77cd9e2e1da5c3e44e/curriculumBuilder/codestudio.py
  def self.find_skippable_syntax(markdown)
    regex = /\[code-studio[\d \-]*\]|\[\/?guide\]/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.find_slides(markdown)
    regex = /^slide!!!slide-\d+(?:<!-- place where you'd like the icon -->)?/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.create_activity_with_levels(levels, lesson_id, position)
    lesson_activity = LessonActivity.new
    lesson_activity.name = "Levels"
    lesson_activity.lesson_id = lesson_id
    lesson_activity.seeding_key = SecureRandom.uuid
    lesson_activity.position = position
    lesson_activity.save!
    lesson_activity.reload
    activity_sections = []
    current_progression_levels = []
    current_progression = nil
    levels.each do |level|
      if current_progression.nil? || current_progression == level.progression
        current_progression = level.progression if current_progression.nil?
        current_progression_levels.push(level)
      else
        section = create_activity_section_with_levels(current_progression_levels, lesson_activity.id)
        section.name = current_progression
        section.position = activity_sections.length + 1
        section.save!
        activity_sections.push(section)
        current_progression_levels = [level]
        current_progression = level.progression
      end
    end
    unless current_progression_levels.empty?
      section = create_activity_section_with_levels(current_progression_levels, lesson_activity.id)
      section.name = current_progression
      section.position = activity_sections.length + 1
      section.save!
      activity_sections.push(section)
    end
    lesson_activity.activity_sections = activity_sections
    lesson_activity
  end

  def self.create_activity_section_with_levels(script_levels, lesson_activity_id)
    return nil if script_levels.empty?
    activity_section = ActivitySection.new
    activity_section.seeding_key ||= SecureRandom.uuid
    activity_section.position = 0
    activity_section.lesson_activity_id = lesson_activity_id
    activity_section.save!
    sl_data = script_levels.each_with_index.map {|l, i| JSON.parse({id: l.id, assessment: l.assessment, bonus: l.bonus, challenge: l.challenge, levels: l.levels, activitySectionPosition: i}.to_json)}
    activity_section.update_script_levels(sl_data) unless sl_data.blank?
    activity_section
  end

  def self.find_remarks(markdown)
    regex = /^!!! *say\s+?[\n\r]*([\d\D]+?)(?=(^\S|$))/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.create_activity_section_with_remark(match)
    activity_section = ActivitySection.new
    activity_section.remarks = true
    description = match[1].strip
    slide_matches = find_slides(description)
    if slide_matches.empty? || description.index(slide_matches[0][0]) != 0
      activity_section.description = description.strip
    else
      activity_section.description = description.delete_prefix(slide_matches[0][0])
      activity_section.slide = true
    end
    activity_section
  end

  # https://github.com/code-dot-org/remark-plugins/blob/master/src/tip.js
  def self.find_tips(markdown)
    regex = /^!!! *?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?(?:[\s]+$)+([\d\D]+?)(?=(^\S|^$))/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  # https://github.com/code-dot-org/remark-plugins/blob/master/src/tiplink.js
  def self.find_tip_links(markdown)
    regex = /^([\w-]+)!!! ?([\w-]+)(?:<!-- place where you'd like the icon -->)?(.+?)$/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.format_tip_markdown(markdown)
    markdown = markdown.chomp.reverse.chomp.reverse
    markdown.gsub(/(^\t|^ {4})/, '')
  end

  def self.create_tip(type, key, markdown)
    tip_map = {
      "tip" => "teachingTip",
      "content" => "contentCorner",
      "discussion" => "discussionGoal",
      "assessment" => "assessmentOpportunity"
    }
    {key: key, type: tip_map[key], markdown: format_tip_markdown(markdown)}
  end

  def self.create_activity_section_with_tip(tip_link_match, tip_match_map)
    tip = tip_match_map[tip_link_match[2]]
    unless tip
      return ActivitySection.new(description: tip_link_match[3].strip)
    end
    tip_match = tip[:match]
    tip_match_map.delete(tip_link_match[2]) if tip_match
    activity_section = ActivitySection.new

    # Sometimes theres the the slide icon here as well. Check for that and apply if needed.
    description = tip_link_match[3].strip
    slide_matches = find_slides(description)
    if slide_matches.empty? || description.index(slide_matches[0][0]) != 0
      activity_section.description = description.strip
    else
      activity_section.description = description.delete_prefix(slide_matches[0][0])
      activity_section.slide = true
    end

    activity_section.tips = [create_tip(tip_match[3] || "#{tip_match[1]}-0", tip_match[1] || "tip", tip_match[4])]
    activity_section
  end

  def self.find_markdown_chunks(markdown, existing_matches)
    matches = []
    unless existing_matches.first[:index] == 0
      matches.push({index: 0, type: 'markdown', substring: markdown[0...existing_matches[0][:index]]})
    end
    (0...existing_matches.length).each do |i|
      matches.push(existing_matches[i])
      next unless i < existing_matches.length - 1 && existing_matches[i][:index] + existing_matches[i][:substring].length < existing_matches[i + 1][:index]
      start_index = existing_matches[i][:index] + existing_matches[i][:substring].length
      substring = markdown[start_index...existing_matches[i + 1][:index]].strip
      matches.push({index: start_index, type: 'markdown', substring: substring}) unless substring.empty?
    end
    unless matches.last[:index] + matches.last[:substring].length == markdown.length
      matches.push({index: 0, type: 'markdown', substring: markdown[existing_matches.last[:index] + existing_matches.last[:substring].length...markdown.length]})
    end
    matches
  end
end
