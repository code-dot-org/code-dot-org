module LessonImportHelper

  def self.create_activity_sections(activity_markdown, position)
    #tips = parse_tips(activity_markdown)
    #return [ActivitySection.new(description: activity_markdown, seeding_key: SecureRandom.uuid, position: 1, tips: tips)]
    tip_matches = find_tips(activity_markdown).map { |m| {index:activity_markdown.index(m[0]), type: 'tip', match: m, substring: m[0]}}
    remark_matches = find_remarks(activity_markdown).map { |m| {index:activity_markdown.index(m[0]), type: 'remark', match: m, substring: m[0]}}
    matches = tip_matches + remark_matches
    sorted_matches = matches.sort_by{|m| m[:index]}
    return [ActivitySection.new(description: activity_markdown.strip, seeding_key: SecureRandom.uuid, position: 1)] if matches.empty?
    sorted_matches = find_markdown_chunks(activity_markdown, sorted_matches)
    sections = []
    sorted_matches.each_with_index do |match, i|
      activity_section = nil
      if match[:type] == 'tip'
        activity_section = create_activity_section_with_tip(match[:match])
      elsif match[:type] == 'remark'
        activity_section = create_activity_section_with_remark(match[:match])
      else
        activity_section = ActivitySection.new(description: match[:substring].strip)
      end
      activity_section.position = i+1
      activity_section.seeding_key = SecureRandom.uuid
      sections = sections + [activity_section]
    end
    sections
  end

  def self.create_lesson_activities(activities_json)
    activities_data = activities_json
    activities = activities_data.map.with_index(1) do |a, i|
      activity = LessonActivity.new
      activity.name = a['name']
      activity.activity_sections = create_activity_sections(a['content'], i)
      activity.seeding_key = SecureRandom.uuid
      activity.position = i
      activity
    end
    activities
  end

  def self.create_lesson(lesson_json, script, lesson_group, persisted_lesson = nil)
    lesson_data = JSON.parse(lesson_json)
    lesson = persisted_lesson || Lesson.new
    lesson.name = lesson_data['title']
    lesson.key = lesson.name.tr(' ', '_').downcase
    lesson.script = script
    lesson.lesson_group = lesson_group
    lesson.overview = lesson_data['overview']
    lesson.relative_position = lesson_data['number'] || 1
    lesson.lesson_activities = create_lesson_activities(lesson_data['activities'])
    lesson
  end

  def self.find_remarks(markdown)
    regex = /^!!!say\s+?[\n\r]+([\d\D]+?)$/
    markdown.to_enum(:scan, regex).map { Regexp.last_match }
  end

  def self.create_activity_section_with_remark(match)
    activity_section = ActivitySection.new
    activity_section.remarks = true
    activity_section.description = match[1].strip
    activity_section
  end

  def self.find_tips(markdown)
    #regex = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)\n([\d\D]+?)([\w-]+)!!!(.*?)$/
    regex = /^!!!?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)[\n\r]([\d\D]+?)^([\w-]+)!!![a-zA-Z0-9\-]+(?:<!-- place where you'd like the icon -->)?(.+?)$/
    markdown.to_enum(:scan, regex).map { Regexp.last_match }
  end

  def self.create_activity_section_with_tip(match)
    tip_map = {
      "tip" => "teachingTip",
      "content" => "contentCorner",
      "discussion" => "discussionGoal",
      "assessment" => "assessmentOpportunity"
    }
    activity_section = ActivitySection.new
    activity_section.description = match[6].strip
    tip = {key: match[3] || "#{match[1]}-0", type: tip_map[match[1]] || "teachingTip", markdown: match[4].strip}
    activity_section.tips = [tip]
    activity_section
  end

  def self.parse_tips(markdown)
    tip_map = {
      "tip" => "teachingTip",
      "content" => "contentCorner",
      "discussion" => "discussionGoal",
      "assessment" => "assessmentOpportunity"
    }
    regex = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?\n([\d\D]+?)([\w-]+)!!!(.*?)$/
    edited_markdown = markdown
    match = edited_markdown.match regex
    tips = []
    count = 0
    while !match.nil?
      tip = {key: match[3] || "unknown-#{count}", type: tip_map[match[1]] || "teachingTip", markdown: match[4]}
      tips.concat [tip]
      start_index = edited_markdown.index regex
      edited_markdown.slice!(start_index, start_index + match[0].length)
      match = edited_markdown.match regex
      count += 1
      break if count > 5
    end
    tips
  end

  def self.find_markdown_chunks(markdown, existing_matches)
    matches = []
    unless existing_matches.first[:index] == 0
      matches.push({index: 0, type: 'markdown', substring: markdown[0...existing_matches[0][:index]]})
    end
    (0...existing_matches.length).each do |i|
      matches.push(existing_matches[i])
      if i < existing_matches.length - 1 && existing_matches[i][:index] + existing_matches[i][:substring].length < existing_matches[i+1][:index]
        start_index = existing_matches[i][:index] + existing_matches[i][:substring].length
        substring = markdown[start_index...existing_matches[i+1][:index]].strip
        matches.push({index: start_index, type: 'markdown', substring: substring}) unless substring.empty?
      end
    end
    unless matches.last[:index] + matches.last[:substring].length == markdown.length
      matches.push({index: 0, type: 'markdown', substring: markdown[existing_matches.last[:index] + existing_matches.last[:substring].length...markdown.length]})
    end
    matches
  end
end
