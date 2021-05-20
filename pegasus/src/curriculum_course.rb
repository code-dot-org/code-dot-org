class CurriculumCourse
  Lesson = Struct.new(:number, :url, :title, :description, :path)
  Unit = Struct.new(:number, :title, :description)

  PRODUCTION_COURSES = %w(course1 course2 course3 course4 msm algebra misc unplugged science).freeze
  COURSES_WITHOUT_UNIT_NUMBERS = %w(course1 course2 course3 course4 msm algebra misc).freeze
  COURSES_WITH_PDF_GENERATION = %w(course1 course2 course3 course4 msm algebra misc csp).freeze

  def initialize(kind)
    @kind = kind
    @dir = sites_dir("virtual/curriculum-#{@kind}")
  end

  def url
    "/curriculum/#{@kind}"
  end

  def path
    "curriculum-#{@kind}"
  end

  def has_units?
    !COURSES_WITHOUT_UNIT_NUMBERS.include? @kind
  end

  def get_course_info
    YAML.load_file(File.join(@dir, 'info.yml'))
  end

  def get_units
    return [] unless has_units?

    units = []
    course_info = get_course_info
    unit_dirs = Dir.entries(@dir).select {|entry| valid_lesson_directory?(entry)}
    unit_dirs.map! {|unit| unit.match(/^[\d]*/).to_s.to_i}
    unit_dirs.sort!
    unit_dirs.uniq!
    unit_dirs.each do |unit_number|
      unit = Unit.new
      unit.number = unit_number
      unit.title = course_info[unit_number]['title'] unless course_info[unit_number].nil?
      unit.description = course_info[unit_number]['description'] unless course_info[unit_number].nil?
      units.push unit
    end
    units
  end

  # Retrieves all lessons of a given course, even if divided up into units
  def get_lessons
    return get_lessons_for_unit(nil) unless has_units?

    [].tap do |lessons|
      get_units.each do |unit|
        get_lessons_for_unit(unit.number).each do |lesson|
          lessons << lesson
        end
      end
    end
  end

  def get_lessons_for_unit(unit_number_filter = nil)
    lessons = []
    lesson_dirs = Dir.entries(@dir)
    lesson_dirs.select! {|lesson_id| valid_lesson_directory?(lesson_id)}
    lesson_dirs.select! {|lesson_id| lesson_in_unit?(lesson_id, unit_number_filter)} unless unit_number_filter.nil?
    lesson_dirs.each do |lesson_id|
      yaml_path = File.join(@dir, lesson_id, 'info.yml')
      next unless File.file?(yaml_path)
      lesson_info = YAML.load_file(yaml_path)
      lesson = Lesson.new
      lesson.number = lesson_number(lesson_id)
      lesson.url = "#{url}/#{lesson_id}"
      lesson.title = lesson_info['title']
      lesson.description = lesson_info['description']
      lesson.path = File.join(path, lesson_id)
      lessons.push lesson
    end
    # Just push all the lessons without a number to the end.
    lessons.sort_by! {|k| k[:number] != "" ? k[:number].to_i : 10000}
    lessons
  end

  def lesson_number(lesson_id)
    lesson_id.scan(/\d+/).last.to_s
  end

  def lesson_in_unit?(lesson_id, unit_number)
    lesson_id.match(/^[\d]*/).to_s == unit_number.to_s
  end

  def valid_lesson_directory?(lesson_id)
    File.directory?(File.join(@dir, lesson_id)) && valid_lesson_directory_name(lesson_id)
  end

  def valid_lesson_directory_name(lesson_dirname)
    lesson_dirname != '.' && lesson_dirname != '..' && lesson_dirname.chars.first != '_'
  end

  def self.virtual_to_v3_path(local_virtual_path)
    local_virtual_path.sub(pegasus_dir('sites/virtual/curriculum-'), sites_v3_dir('code.org/public/curriculum/'))
  end
end
