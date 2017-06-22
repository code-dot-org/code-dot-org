# == Schema Information
#
# Table name: courses
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_courses_on_name  (name)
#

class Course < ApplicationRecord
  # Some Courses will have an associated Plc::Course, most will not
  has_one :plc_course, class_name: 'Plc::Course'
  has_many :course_scripts, -> {order('position ASC')}

  after_save :write_serialization

  scope :with_associated_models, -> {includes([:plc_course, :course_scripts])}

  def skip_name_format_validation
    !!plc_course
  end

  include SerializedToFileValidation

  def to_param
    name
  end

  def localized_title
    I18n.t("data.course.name.#{name}.title", default: name)
  end

  def self.file_path(name)
    Rails.root.join("config/courses/#{name}.course")
  end

  def self.load_from_path(path)
    serialization = File.read(path)
    hash = JSON.parse(serialization)
    course = Course.find_or_create_by!(name: hash['name'])
    course.update_scripts(hash['script_names'])
  rescue Exception => e
    # print filename for better debugging
    new_e = Exception.new("in course: #{path}: #{e.message}")
    new_e.set_backtrace(e.backtrace)
    raise new_e
  end

  # Updates courses.en.yml with our new localizeable strings
  # @param name [string] - name of the course being updated
  # @param course_strings[Hash{String => String}]
  def self.update_strings(name, course_strings)
    courses_yml = File.expand_path('config/locales/courses.en.yml')
    i18n = File.exist?(courses_yml) ? YAML.load_file(courses_yml) : {}

    i18n.deep_merge!({'en' => {'data' => {'course' => {'name' => {name => course_strings.to_h}}}}})
    File.write(courses_yml, "# Autogenerated scripts locale file.\n" + i18n.to_yaml(line_width: -1))
  end

  def serialize
    JSON.pretty_generate(
      {
        name: name,
        script_names: course_scripts.map(&:script).map(&:name)
      }
    )
  end

  # This method updates both our localizeable strings related to this course, and
  # the set of scripts that are in the course, then writes out our serialization
  # @param scripts [Array<String>] - Updated list of names of scripts in this course
  # @param course_strings[Hash{String => String}]
  def persist_strings_and_scripts_changes(scripts, course_strings)
    Course.update_strings(name, course_strings)
    update_scripts(scripts) if scripts
    save!
  end

  def write_serialization
    # Only save non-plc course, and only in LB mode
    return unless Rails.application.config.levelbuilder_mode && !plc_course
    File.write(Course.file_path(name), serialize)
  end

  # @param new_scripts [Array<String>]
  def update_scripts(new_scripts)
    new_scripts = new_scripts.reject(&:empty?)
    # we want to delete existing course scripts that aren't in our new list
    scripts_to_delete = course_scripts.map(&:script).map(&:name) - new_scripts

    new_scripts.each_with_index do |script_name, index|
      script = Script.find_by_name!(script_name)
      course_script = CourseScript.find_or_create_by!(course: self, script: script) do |cs|
        cs.position = index + 1
      end
      course_script.update!(position: index + 1)
    end

    scripts_to_delete.each do |script_name|
      script = Script.find_by_name!(script_name)
      CourseScript.where(course: self, script: script).destroy_all
    end
    # Reload model so that course_scripts is up to date
    reload
  end

  def summarize
    {
      name: name,
      title: localized_title,
      description_short: I18n.t("data.course.name.#{name}.description_short", default: ''),
      description_student: I18n.t("data.course.name.#{name}.description_student", default: ''),
      description_teacher: I18n.t("data.course.name.#{name}.description_teacher", default: ''),
      scripts: course_scripts.map(&:script).map do |script|
        include_stages = false
        script.summarize(include_stages).merge!(script.summarize_i18n(include_stages))
      end
    }
  end

  @@course_cache = nil
  COURSE_CACHE_KEY = 'course-cache'.freeze

  def self.should_cache?
    return false if Rails.application.config.levelbuilder_mode
    ENV['UNIT_TEST'] || ENV['CI']
  end

  # generates our course_cache from what is in the Rails cache
  def self.course_cache_from_cache
    # make sure possible loaded objects are completely loaded
    [CourseScript, Plc::Course].each(&:new)
    Rails.cache.read COURSE_CACHE_KEY
  end

  def self.course_cache_from_db
    {}.tap do |cache|
      Course.with_associated_models.find_each do |course|
        cache[course.name] = course
        cache[course.id.to_s] = course
      end
    end
  end

  def self.course_cache_to_cache
    Rails.cache.write(COURSE_CACHE_KEY, course_cache_from_db)
  end

  def self.course_cache
    return nil unless should_cache?
    @@course_cache ||=
      course_cache_from_cache || course_cache_from_db
  end

  def self.get_without_cache(id_or_name)
    # a bit of trickery so we support both ids which are numbers and
    # names which are strings that may contain numbers (eg. 2-3)
    find_by = (id_or_name.to_i.to_s == id_or_name.to_s) ? :id : :name
    # unlike script cache, we don't throw on miss
    Course.with_associated_models.find_by(find_by => id_or_name)
  end

  def self.get_from_cache(id_or_name)
    return get_without_cache(id_or_name) unless should_cache?

    course_cache.fetch(id_or_name.to_s) do
      # Populate cache on miss.
      course_cache[id_or_name.to_s] = get_without_cache(id_or_name)
    end
  end
end
