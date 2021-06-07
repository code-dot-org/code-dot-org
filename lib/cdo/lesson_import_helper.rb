# Helper module for importing data from curriculumbuilder
module LessonImportHelper
  # This method takes lesson and activity data exported from curriculum builder
  # and updates corresponding fields of this lesson to match it. The expected
  # input format is as follows:
  # {
  #   "title": "Lesson Title",
  #   "number": 1,
  #   "student_desc": "Student-facing description",
  #   "teacher_desc": "Teacher-facing description",
  #   "activities": [
  #     {
  #       "name": "Activity name",
  #       "duration": "5-10 minutes",
  #       "content": "Activity markdown"
  #     },
  #     ...
  #   ]
  # }
  # @param [Lesson] lesson - Code Studio Lesson object to update.
  # @param [Hash] cb_lesson_data - Lesson and activity data to import.
  def self.update_lesson(lesson, models_to_import = [], cb_lesson_data = {})
    raise unless [:development, :adhoc, :levelbuilder].include? rack_env
    raise unless lesson.script.hidden

    # course version id should always be present for CSF/CSD/CSP 2020 courses.
    course_version_id = lesson.script&.get_course_version&.id
    raise "Script must have course version" unless course_version_id

    lesson_levels = lesson.script_levels.reject {|l| l.levels[0].type == 'CurriculumReference'}
    # Lockable lessons need to be handled as a separate case
    if cb_lesson_data.empty?
      if models_to_import.include?('Lesson')
        lesson.lesson_activities = update_lockable_lesson(lesson_levels, lesson.id)
        lesson.script_levels = []
      end
    else
      if models_to_import.include?('Lesson')
        lesson.name = cb_lesson_data['title']
        lesson.overview = cb_lesson_data['teacher_desc']
        lesson.student_overview = cb_lesson_data['student_desc']
        lesson.purpose = cb_lesson_data['cs_content']
        lesson.preparation = cb_lesson_data['prep']
        lesson.creative_commons_license = cb_lesson_data['creative_commons_license']
        lesson.assessment_opportunities = cb_lesson_data['assessment'] unless cb_lesson_data['assessment'].blank?
        lesson.save!

        Script.merge_and_write_i18n(lesson.i18n_hash, lesson.script.name)
      end
      if models_to_import.include?('Objective')
        lesson.objectives = cb_lesson_data['objectives'].map do |o|
          Objective.new(key: SecureRandom.uuid, description: o["name"])
        end
      end
      if models_to_import.include?('Activity')
        lesson.lesson_activities = create_lesson_activities(cb_lesson_data['activities'], lesson_levels, lesson)
        lesson.script_levels = []
      end
      if models_to_import.include?('Resource')
        lesson.resources = create_lesson_resources(cb_lesson_data['resources'], course_version_id)
      end
      if models_to_import.include?('Vocabulary')
        lesson.vocabularies = create_lesson_vocabularies(cb_lesson_data['vocab'], course_version_id)
      end
      if models_to_import.include?('ProgrammingExpression')
        lesson.programming_expressions = find_lesson_programming_expressions(cb_lesson_data['blocks'])
      end
      if models_to_import.include?('Standard')
        lesson.standards = find_lesson_standards(cb_lesson_data['standards'])
      end
    end
  end

  # Lockable lessons don't need to be merged with curriculumbuilder, but we do
  # need the levels to be part of an activity section.
  def self.update_lockable_lesson(script_levels, lesson_id)
    [create_activity_with_levels(script_levels, lesson_id, 1)]
  end

  def self.create_lesson_resources(cb_resources, course_version_id)
    cb_resources.map do |cb_resource|
      raise unless cb_resource['slug']
      resource = Resource.find_or_initialize_by(
        course_version_id: course_version_id,
        key: cb_resource['slug'].downcase.tr(" ", "_")
      )
      resource.name = cb_resource['name']
      resource.url = cb_resource['url']
      resource.type = cb_resource['type']
      resource.audience = cb_resource['student'] ? 'Student' : 'Teacher'
      resource.assessment = false
      resource.download_url = cb_resource['dl_url']
      resource.include_in_pdf = cb_resource['gd']
      resource.save! if resource.changed?
      resource
    end
  end

  def self.create_lesson_vocabularies(cb_vocab, course_version_id)
    return [] if cb_vocab.blank?
    cb_vocab.map do |cb_vocabulary|
      raise unless cb_vocabulary['word']
      key = cb_vocabulary['word'].downcase.tr(" ", "_")
      vocab = Vocabulary.find_or_initialize_by(
        course_version_id: course_version_id,
        key: key
      )
      vocab.word = cb_vocabulary['word']
      vocab.definition =
        if ['csd', 'csp'].include? CourseVersion.find(course_version_id).course_offering.key
          cb_vocabulary['detailDef']
        else
          cb_vocabulary['simpleDef']
        end
      vocab.save! if vocab.changed?
      vocab
    end
  end

  def self.find_lesson_programming_expressions(cb_blocks)
    return [] if cb_blocks.blank?
    cb_blocks.map do |cb_block|
      raise unless cb_block['slug'] && cb_block['parent_slug']
      programming_environment = ProgrammingEnvironment.find_by(name: cb_block['parent_slug'])
      block = ProgrammingExpression.find_by(
        programming_environment_id: programming_environment.id,
        key: cb_block['slug']
      )
      block
    end
  end

  def self.find_lesson_standards(cb_standards)
    return [] if cb_standards.blank?
    cb_standards.map do |cb_standard|
      raise unless cb_standard['framework'] && cb_standard['shortcode']
      framework = Framework.find_by!(shortcode: cb_standard['framework'].downcase)
      Standard.find_by!(framework: framework, shortcode: cb_standard['shortcode'])
    rescue ActiveRecord::RecordNotFound
      puts "Could not find Standard: #{cb_standard}"
    end
  end

  def self.create_activity_sections(activity_markdown, lesson_activity_id, levels)
    activity_markdown.gsub!(/slide!!!slide-\d+(?:<!-- place where you'd like the icon -->)?/, '<i class="fa fa-list-alt" aria-hidden="true"></i>')
    activity_markdown.gsub!(/\[\/?guide\]/, '')
    tip_matches = find_tips(activity_markdown).select {|m| m[1] != 'say'}.map {|m| {index: activity_markdown.index(m[0]), type: 'tip', match: m, substring: m[0]}}
    name_matches = find_activity_section_names(activity_markdown).map {|m| {index: activity_markdown.index(m[0]), type: 'name', match: m, substring: m[0]}}
    pullthrough_matches = find_code_studio_pullthrough(activity_markdown).map {|m| {index: activity_markdown.index(m[0]), type: 'pullthrough', match: m, substring: m[0]}}
    remark_matches = find_remarks(activity_markdown).map {|m| {index: activity_markdown.index(m[0]), type: 'remark', match: m, substring: m[0]}}
    sorted_matches = (tip_matches + name_matches + remark_matches + pullthrough_matches).sort_by {|m| m[:index]}
    sorted_matches = find_markdown_chunks(activity_markdown, sorted_matches)

    # Create a map of tip key -> an array of tip matches
    # Sometimes, a key is used multiple times in the same activity. To handle
    # this we'll, just pair them with the tip links in order.
    tip_match_map = {}
    tip_matches.each do |match|
      key = match[:match][3]&.strip || "#{match[:match][1]}-0"
      tip_match_map[key] ||= []
      tip_match_map[key].push(match)
    end

    sections = []
    name = ''
    sorted_matches.each do |match|
      if match[:type] == 'tip'
        activity_section = ActivitySection.new
        key = match[:match][3]&.strip || "#{match[:match][1]}-0"
        activity_section.tips = [create_tip(key, match[:match][1] || "tip", match[:match][4])]
        activity_section.key ||= SecureRandom.uuid
        activity_sections = [activity_section]
        match[:activity_section_key] = activity_section.key
      elsif match[:type] == 'name'
        name = match[:match][1]
        next
      elsif match[:type] == 'pullthrough'
        next if levels.empty?
        pullthrough_match = match[:match]
        # If the syntax takes the form of [code-studio], [code-studio 1-<length>], or [code-studio 2-<length>],
        # add the level activity sections here.
        if pullthrough_match[1].blank? || ([1, 2].include?(pullthrough_match[1]) && levels.length == pullthrough_match[2].to_i)
          level_sections = create_activity_sections_by_progression(levels, lesson_activity_id)
          sections += level_sections
          levels.clear
        end
        next
      elsif match[:type] == 'remark'
        activity_sections = [create_activity_section_with_remark(match[:match], tip_match_map)]
      else
        activity_sections = create_activity_sections_from_markdown(match[:substring].strip, tip_match_map)
      end
      next unless activity_sections
      activity_sections.each do |section|
        section.position = 0
        unless match[:type] == 'tip'
          section.name = name
          name = ''
        end
        section.key ||= SecureRandom.uuid
        section.lesson_activity_id = lesson_activity_id
        section.save!
        sections.push(section)
      end
    end

    # If there are any tips that didn't have a match, put them at the end
    tip_match_map.each do |_, tip_list|
      tip_list.each do |tip|
        if tip[:paired]
          sections.reject! {|s| s.key == tip[:activity_section_key]}
        end
      end
    end

    sections = sections.flatten
    final_position = 1
    sections.each do |section|
      section.position = final_position
      section.save!
      final_position += 1
    end

    sections
  end

  # Adds an announcement for virtual lesson modifications to the lesson. Returns true if
  # an announcement was added, false otherwise.
  def self.convert_virtual_lesson_modification_activity_to_announcement(activity_data, lesson)
    return false unless activity_data['name'] == 'Lesson Modifications'
    # Virtual lesson modifications are in google docs, so strip out the docs link
    url_match = /.+[vV]irtual.+\((https:\/\/docs.google.com.+)\).+/.match(activity_data['content'])
    return false unless url_match
    announcement = {
      notice: 'Lesson Modifications',
      details: 'Are you teaching in a Virtual setting or Socially-Distanced classroom? Check out our guidelines for modifications.',
      link: url_match[1],
      type: 'information',
      visibility: 'Teacher-only'
    }
    lesson.announcements ||= []
    lesson.announcements.push(announcement)
    lesson.save!
    return true
  end

  def self.create_lesson_activities(activities_data, levels, lesson)
    position = 1
    activities = activities_data.map do |a|
      if a['name'] == 'Lesson Modifications' && convert_virtual_lesson_modification_activity_to_announcement(a, lesson)
        nil
      else
        lesson_activity = LessonActivity.new
        lesson_activity.name = a['name']
        lesson_activity.duration = a['duration'].split[0].to_i
        lesson_activity.lesson_id = lesson.id
        lesson_activity.key = SecureRandom.uuid
        lesson_activity.position = position
        position += 1
        lesson_activity.save!
        lesson_activity.reload
        lesson_activity.activity_sections = create_activity_sections(a['content'], lesson_activity.id, levels)
        lesson_activity
      end
    end.compact

    # Create a lesson with all the levels in them
    # TODO use the [code-studio] syntax from CB instead
    unless levels.empty?
      activities.push(create_activity_with_levels(levels, lesson.id, activities.length + 1))
    end
    activities.flatten
  end

  # https://github.com/code-dot-org/curriculumbuilder/blob/57cad8f62e50b03e4f16bf77cd9e2e1da5c3e44e/curriculumBuilder/codestudio.py
  def self.find_skippable_syntax(markdown)
    # Regex explanation: looks for
    #   - code studio pullthrough, i.e. "[code-studio]", "[code-studio 17]", "[code-studio 1-5]"
    #   - guide syntax, i.e. "[guide]" and "[/guide]"
    regex = /\[\/?guide\]/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.find_code_studio_pullthrough(markdown)
    regex = /^\[code-studio *(\d*)-?(\d*)\]/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.create_activity_with_levels(levels, lesson_id, position)
    lesson_activity = LessonActivity.new
    lesson_activity.name = "Levels"
    lesson_activity.lesson_id = lesson_id
    lesson_activity.key = SecureRandom.uuid
    lesson_activity.position = position
    lesson_activity.save!
    lesson_activity.reload
    lesson_activity.activity_sections = create_activity_sections_by_progression(levels, lesson_activity.id)
    lesson_activity
  end

  def self.create_activity_sections_by_progression(levels, lesson_activity_id, position_offset=1)
    activity_sections = []
    current_progression_levels = []
    current_progression = nil
    levels.each do |level|
      if current_progression.nil? || current_progression == level.progression
        current_progression = level.progression if current_progression.nil?
        current_progression_levels.push(level)
      else
        section = create_activity_section_with_levels(current_progression_levels, lesson_activity_id, current_progression)
        section.position = activity_sections.length + position_offset
        section.save!
        activity_sections.push(section)
        current_progression_levels = [level]
        current_progression = level.progression
      end
    end
    unless current_progression_levels.empty?
      section = create_activity_section_with_levels(current_progression_levels, lesson_activity_id, current_progression)
      section.name = current_progression
      section.position = activity_sections.length + 1
      section.save!
      activity_sections.push(section)
    end
    activity_sections
  end

  def self.create_activity_section_with_levels(script_levels, lesson_activity_id, progression_name="")
    return nil if script_levels.empty?
    activity_section = ActivitySection.new
    activity_section.progression_name = progression_name
    activity_section.key ||= SecureRandom.uuid
    activity_section.position = 0
    activity_section.lesson_activity_id = lesson_activity_id
    activity_section.save!
    sl_data = script_levels.map.with_index(1) {|l, pos| JSON.parse({id: l.id, assessment: l.assessment, bonus: l.bonus, challenge: l.challenge, levels: l.levels, activitySectionPosition: pos}.to_json)}
    activity_section.update_script_levels(sl_data) unless sl_data.blank?
    activity_section
  end

  def self.find_remarks(markdown)
    # Regex explanation:
    #  - line starts with "!!! say", with any number of spaces between !!! and say
    #  - There can be any number of line breaks between this and the content
    #  - Captures all content until either:
    #    - there is a line that starts with non-whitespace OR
    #    - it reaches the end of the string
    regex = /^!!! *say\s+?([\d\D]+?)(?=(^\S|\z))/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.create_activity_section_with_remark(match, tip_match_map)
    tip_link_match = find_first_tip_link(match[1].strip)
    if tip_link_match.nil?
      description = match[1].strip
      activity_section = ActivitySection.new
      activity_section.description = unindent_markdown(description).strip
    else
      activity_section = create_activity_section_with_tip(tip_link_match, tip_match_map)
      # Sometimes the activity section created won't contain everything it needs to.
      # Check if the tip link match equals the remark markdown. If not, we should add
      # the rest of the content.
      if tip_link_match[0].length < match[1].strip.length
        activity_section.description += unindent_markdown(match[1].strip.delete_prefix(tip_link_match[0]))
      end
    end
    activity_section.remarks = true
    activity_section
  end

  def self.find_tips(markdown)
    # See https://github.com/code-dot-org/remark-plugins/blob/master/src/tip.js
    # Looks for tips that look like "!!!tip <tip-0>" followed by text. It will
    # capture the text until it hits either the end of the string or a line that
    # starts with a non-whitespace character.
    regex = /^!!! *?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?(?:[\s]+$)+([\d\D]+?)(?=(^\S|\z))/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  def self.find_first_tip_link(markdown)
    # See https://github.com/code-dot-org/remark-plugins/blob/master/src/tiplink.js
    # Looks for the location where tip icons should appear
    # Example: tip!!!tip-0<!-- place where you'd like the icon --> some text
    # <!-- place where you'd like the icon --> is optional but is written out
    # in this regex in order to be able to correctly the text that should be displayed
    regex = /^?(\S+ +)?([\w-]+)!!! ?([\w-]+)(?:<!-- place where you'd like the icon -->)?(.*\n?.*)$/
    markdown.match(regex)
  end

  # Removes tabs (or 4 spaces) at the beginning of lines
  def self.unindent_markdown(markdown)
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
    {key: key, type: tip_map[key], markdown: unindent_markdown(markdown)}
  end

  def self.create_activity_section_with_tip(tip_link_match, tip_match_map)
    tip = tip_match_map[tip_link_match[3]]&.detect {|t| !t[:paired]}
    description = (tip_link_match[1] || '') + tip_link_match[4]
    unless tip
      return ActivitySection.new(description: description)
    end
    tip[:paired] = true
    tip_match = tip[:match]
    activity_section = ActivitySection.new

    activity_section.description = description.strip

    activity_section.tips = [create_tip(tip_match[3] || "#{tip_match[1]}-0", tip_match[1] || "tip", tip_match[4])]
    activity_section
  end

  def self.find_activity_section_names(markdown)
    regex = /^### (.+)$/
    markdown.to_enum(:scan, regex).map {Regexp.last_match}
  end

  # We preprocess activity markdown to look for remarks, pullthrough, names, and tips
  # but we need to look for tips (which may not be at the beginning of a line) and
  # create pure markdown sections.
  def self.create_activity_sections_from_markdown(markdown, tip_match_map)
    sections = []
    stripped_markdown = markdown.strip
    tip = find_first_tip_link(stripped_markdown)
    while tip
      tip_index = stripped_markdown.index(tip[0])
      if tip_index != 0
        description = stripped_markdown[0...tip_index].strip
        sections.push(ActivitySection.new(description: description)) unless description.empty?
      end
      sections.push(create_activity_section_with_tip(tip, tip_match_map))
      stripped_markdown = stripped_markdown[tip_index + tip[0].length...stripped_markdown.length]
      tip = find_first_tip_link(stripped_markdown)
    end
    description = stripped_markdown.strip
    sections.push(ActivitySection.new(description: description)) unless description.empty?
    sections
  end

  def self.find_markdown_chunks(markdown, existing_matches)
    return [{index: 0, type: 'markdown', substring: markdown}] if existing_matches.empty?
    matches = []
    unless existing_matches.first[:index] == 0
      substring = markdown[0...existing_matches[0][:index]].strip
      matches.push({index: 0, type: 'markdown', substring: substring}) unless substring.empty?
    end
    (0...existing_matches.length).each do |i|
      matches.push(existing_matches[i])
      next unless i < existing_matches.length - 1 && existing_matches[i][:index] + existing_matches[i][:substring].length < existing_matches[i + 1][:index]
      start_index = existing_matches[i][:index] + existing_matches[i][:substring].length
      substring = markdown[start_index...existing_matches[i + 1][:index]].strip
      matches.push({index: start_index, type: 'markdown', substring: substring}) unless substring.empty?
    end
    unless matches.last[:index] + matches.last[:substring].length == markdown.length
      substring = markdown[existing_matches.last[:index] + existing_matches.last[:substring].length...markdown.length].strip
      matches.push({index: 0, type: 'markdown', substring: substring}) unless substring.empty?
    end
    matches
  end
end
