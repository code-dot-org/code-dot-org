module LessonImportHelper

  def self.create_activity_sections(activity_markdown, position, levels)
    #tips = parse_tips(activity_markdown)
    #return [ActivitySection.new(description: activity_markdown, seeding_key: SecureRandom.uuid, position: 1, tips: tips)]
    tip_matches = find_tips(activity_markdown).map { |m| {index:activity_markdown.index(m[0]), type: 'tip', match: m, substring: m[0]}}
    tip_link_matches = find_tip_links(activity_markdown).map { |m| {index:activity_markdown.index(m[0]), type: 'tiplink', match: m, substring: m[0]}}
    remark_matches = find_remarks(activity_markdown).map { |m| {index:activity_markdown.index(m[0]), type: 'remark', match: m, substring: m[0]}}
    pullthrough_matches = find_code_studio_pullthroughs(activity_markdown).map { |m| {index:activity_markdown.index(m[0]), type: 'pullthrough', match: m, substring: m[0]}}
    matches = tip_matches + remark_matches + tip_link_matches + pullthrough_matches
    sorted_matches = matches.sort_by{|m| m[:index]}
    return [ActivitySection.new(description: activity_markdown.strip, seeding_key: SecureRandom.uuid, position: 1)] if matches.empty?
    sorted_matches = find_markdown_chunks(activity_markdown, sorted_matches)
    sections = []
    tip_match_map = {}
    tip_matches.each do |match|
      key = match[:match][3] || "#{match[:match][1]}-0"
      tip_match_map[key] = match
    end
    sorted_matches.each_with_index do |match, i|
      activity_section = nil
      if match[:type] == 'tip'
        #key = match[:match][3] || "#{match[:match][1]}-0"
        #tip_match_map[key] = match
        next
      elsif match[:type] == 'tiplink'
        activity_section = create_activity_section_with_tip(match[:match], tip_match_map)
      elsif match[:type] == 'remark'
        activity_section = create_activity_section_with_remark(match[:match])
      elsif match[:type] == 'pullthrough'
        activity_section = create_activity_section_with_levels(match[:match], levels)
      else
        activity_section = ActivitySection.new(description: match[:substring].strip)
      end
      activity_section.position = i+1
      activity_section.seeding_key ||= SecureRandom.uuid
      sections = sections + [activity_section]
    end
    sections
  end

  def self.create_lesson_activities(activities_data, levels = {})
    activities = activities_data.map.with_index(1) do |a, i|
      @lesson_activity = LessonActivity.new
      @lesson_activity.name = a['name']
      @lesson_activity.duration = a['duration'].split[0]
      @lesson_activity.lesson = @lesson
      @lesson_activity.lesson_id = @lesson.id
      @lesson_activity.seeding_key = SecureRandom.uuid
      @lesson_activity.position = i
      @lesson_activity.save!
      @lesson_activity.reload
      @lesson_activity.activity_sections = create_activity_sections(a['content'], i, levels)
      @lesson_activity
    end
    unless levels.empty?
      @lesson_activity = LessonActivity.new
      @lesson_activity.name = "Leftover levels"
      @lesson_activity.lesson = @lesson
      @lesson_activity.lesson_id = @lesson.id
      @lesson_activity.seeding_key = SecureRandom.uuid
      @lesson_activity.position = activities.length + 1
      @lesson_activity.save!
      @lesson_activity.reload
      @lesson_activity.activity_sections = [create_activity_section_with_level_ranges(0, levels.count-1, levels)]
      activities.push(@lesson_activity)
    end
    activities.flatten
  end

  def self.create_lesson(lesson_data, persisted_lesson)
    #lesson_data = JSON.parse(lesson_json)
    levels = persisted_lesson.script_levels.each_with_index.map{|l,i| JSON.parse({id: l.id, assessment: l.assessment, bonus: l.bonus, challenge:l.challenge, levels: l.levels, activitySectionPosition: i}.to_json)}
    @lesson = persisted_lesson || Lesson.new
    @lesson.script_levels = []
    @lesson.save!
    @lesson.name = lesson_data['title']
    @lesson.key ||= lesson.name.tr(' ', '_').downcase
    @lesson.overview = lesson_data['teacher_desc']
    @lesson.student_overview = lesson_data['student_desc']
    @lesson.relative_position = lesson_data['number'] || 1
    @lesson.save!
    @lesson.lesson_activities = create_lesson_activities(lesson_data['activities'], levels)
    #@lesson.script_levels = levels
    @lesson.script.fix_script_level_positions
  end

  # https://github.com/code-dot-org/curriculumbuilder/blob/57cad8f62e50b03e4f16bf77cd9e2e1da5c3e44e/curriculumBuilder/codestudio.py
  def self.find_code_studio_pullthroughs(markdown)
    regex = /(\[code-studio\s*)(\d+)?-?(\d+)?\]/
    markdown.to_enum(:scan, regex).map { Regexp.last_match }
  end

  def self.create_activity_section_with_levels(match, levels)
    range_start = match[2] || 0
    range_end = match[3] || levels.length-1
    create_activity_section_with_level_ranges(range_start, range_end, levels)
  end

  def self.create_activity_section_with_level_ranges(range_start, range_end, levels)
    activity_section = ActivitySection.new
    activity_section.seeding_key ||= SecureRandom.uuid
    activity_section.position = 0
    activity_section.lesson_activity = @lesson_activity
    activity_section.lesson_activity_id = @lesson_activity.id
    activity_section.save!
    activity_section.description = "levels #{range_start} to #{range_end}"
    unless levels.empty?
      #activity_section.script_levels = levels[range_start..range_end]
      #sl_data = levels[range_start..range_end].each_with_index.map{|l,i| JSON.parse({id: l.id, assessment: l.assessment, bonus: l.bonus, challenge:l.challenge, levels: l.levels, activitySectionPosition: i}.to_json)}
      sl_data = levels.slice!(range_start..range_end)
      activity_section.update_script_levels(sl_data)
    end
    activity_section
  end

  def self.find_remarks(markdown)
    regex = /^!!!say\s+?[\n\r]+([\d\D]+?)(?=^( {0,3}|\S))/
    markdown.to_enum(:scan, regex).map { Regexp.last_match }
  end

  def self.create_activity_section_with_remark(match)
    activity_section = ActivitySection.new
    activity_section.remarks = true
    activity_section.description = match[1].strip
    activity_section
  end

  # https://github.com/code-dot-org/remark-plugins/blob/master/src/tip.js
  def self.find_tips(markdown)
    #regex = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)\n([\d\D]+?)([\w-]+)!!!(.*?)$/
    #regex = /^!!!?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)[\n\r]([\d\D]+?)^([\w-]+)!!![a-zA-Z0-9\-]+(?:<!-- place where you'd like the icon -->)?(.+?)$/
    regex = /^!!! *?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?(?:[\s]+$)+([\d\D]+?)(?=^\S)/
    markdown.to_enum(:scan, regex).map { Regexp.last_match }
  end

  # https://github.com/code-dot-org/remark-plugins/blob/master/src/tiplink.js
  def self.find_tip_links(markdown)
    regex = /^([\w-]+)!!! ?([\w-]+)(?:<!-- place where you'd like the icon -->)?(.+?)$/
    markdown.to_enum(:scan, regex).map { Regexp.last_match }
  end

  def self.create_activity_section_with_tip(tip_link_match, tip_match_map)
    tip_map = {
      "tip" => "teachingTip",
      "content" => "contentCorner",
      "discussion" => "discussionGoal",
      "assessment" => "assessmentOpportunity"
    }
    tip_match = tip_match_map[tip_link_match[2]][:match]
    activity_section = ActivitySection.new
    activity_section.description = tip_link_match[3].strip
    tip = {key: tip_match[3] || "#{tip_match[1]}-0", type: tip_map[tip_match[1]] || "teachingTip", markdown: tip_match[4]}
    activity_section.tips = [tip]
    activity_section
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
