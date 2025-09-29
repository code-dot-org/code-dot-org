# frozen_string_literal: true

# == Schema Information
#
# Table name: course_offerings
#
#  id                               :integer          not null, primary key
#  key                              :string(255)      not null
#  display_name                     :string(255)      not null
#  created_at                       :datetime         not null
#  updated_at                       :datetime         not null
#  is_featured                      :boolean          default(FALSE), not null
#  assignable                       :boolean          default(TRUE), not null
#  curriculum_type                  :string(255)
#  marketing_initiative             :string(255)
#  grade_levels                     :string(255)
#  header                           :string(255)
#  image                            :string(255)
#  cs_topic                         :string(255)
#  school_subject                   :string(255)
#  device_compatibility             :string(255)
#  description                      :string(255)
#  professional_learning_program    :string(255)
#  video                            :string(255)
#  published_date                   :datetime
#  self_paced_pl_course_offering_id :integer
#  ai_teaching_assistant_available  :boolean          default(FALSE), not null
#  facilitator_course_permissions   :json
#
# Indexes
#
#  index_course_offerings_on_key  (key) UNIQUE
#

class CourseOffering < ApplicationRecord
  include Curriculum::SharedCourseConstants
  include Localizable

  ACCEPTABLE_RESOURCE_TYPES = [
    'Answer Key',
    'Activity Guide',
    'Slides',
    'Exemplar',
    'Slide Deck',
    'Rubric'
  ]
  DURATION_LABEL_TO_MINUTES_CAP = {
    lesson: 90,
    week: 250,
    month: 950,
    quarter: 2_500,
    semester: 5_000,
    school_year: 525_600,
  }
  ELEMENTARY_SCHOOL_GRADES = %w[K 1 2 3 4 5].freeze
  HIGH_SCHOOL_GRADES = %w[9 10 11 12].freeze
  KEY_CHAR_RE = /[a-z0-9\-]/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  MIDDLE_SCHOOL_GRADES = %w[6 7 8].freeze
  PROFESSIONAL_LEARNING_PROGRAM_PATHS = {
    'K5 Workshops': 'https://code.org/professional-development-workshops',
    '6-12 Workshops': 'https://code.org/apply',
  }

  has_many :course_versions
  belongs_to :self_paced_pl_course_offering, class_name: 'CourseOffering', optional: true

  has_and_belongs_to_many :pd_workshops, class_name: 'Pd::Workshop', join_table: :course_offerings_pd_workshops, association_foreign_key: 'pd_workshop_id'

  validates :curriculum_type, acceptance: {accept: Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.to_h.values, message: "must be one of the course offering curriculum types. Expected one of: #{Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.to_h.values}. Got: \"%{value}\"."}, allow_nil: true
  validates :marketing_initiative, acceptance: {accept: Curriculum::SharedCourseConstants::COURSE_OFFERING_MARKETING_INITIATIVES.to_h.values, message: "must be one of the course offering marketing initiatives. Expected one of: #{Curriculum::SharedCourseConstants::COURSE_OFFERING_MARKETING_INITIATIVES.to_h.values}. Got: \"%{value}\"."}, allow_nil: true
  validate :grade_levels_format

  validates :key,
    format: {with: KEY_RE,
    message: "must contain only lowercase alphabetic characters, numbers, and dashes; got \"%{value}\"."}

  validates :professional_learning_program, acceptance: {accept: PROFESSIONAL_LEARNING_PROGRAM_PATHS.values, message: "must be one of the professional learning program path. Expected one of: #{PROFESSIONAL_LEARNING_PROGRAM_PATHS.values}. Got:  \"%{value}\"."}, allow_nil: true

  self.localizable_attributes = :display_name, :description

  # Seeding method for creating / updating / deleting a CourseOffering and CourseVersion for the given
  # potential content root, i.e. a UnitGroup.
  #
  # Examples:
  #
  # csp1-2019.script does not represent a content root (the root for CSP, Version 2019 is a UnitGroup).
  # Therefore, this method will not create any new objects.
  #
  # This method will also delete CourseOfferings and/or CourseVersions that were previously associated with
  # the content_root, if appropriate. See CourseVersion#add_course_version for details.
  def self.add_course_offering(content_root)
    unless content_root.is_a?(UnitGroup)
      raise "cannot create CourseOffering for content root #{content_root.name} that is not a UnitGroup"
    end

    if content_root.is_course?
      offering = CourseOffering.find_or_create_by!(key: content_root.family_name) do |co|
        co.display_name = content_root.family_name if co.display_name.nil_or_empty?
      end

      if Rails.application.config.levelbuilder_mode
        offering.write_serialization
      end
    else
      offering = nil
    end

    CourseVersion.add_course_version(offering, content_root)

    offering
  end

  # @param locale_code [String] User or request locale. Optional.
  # @return [CourseVersion] Returns the latest stable version in a course family supported in the given locale.
  #   If the locale is in English or the latest stable version is nil (either because previous versions are not
  #   supported in given locale or because the only version(s) are in a 'preview' state), then return the latest
  #   launched (a.k.a. published) version.
  def latest_published_version(locale_code = 'en-us')
    locale_str = locale_code&.to_s
    unless locale_str&.start_with?('en')
      latest_stable_version = UnitGroup.latest_stable_version(key, locale: locale_str)
      return latest_stable_version.course_version unless latest_stable_version.nil?
    end

    course_versions.select do |cv|
      cv.content_root.launched?
    end.max_by(&:version_year)
  end

  def path_to_latest_published_version(locale_code = 'en-us')
    return nil unless latest_published_version(locale_code)
    latest_published_version(locale_code).content_root.link
  end

  def display_name_with_latest_year(locale_code = 'en-us')
    return localized_display_name unless latest_published_version(locale_code)
    latest_published_version(locale_code).content_root.localized_assignment_family_title
  end

  def course_id
    latest_published_version&.content_root&.id
  end

  def self.should_cache?
    Unit.should_cache?
  end

  def self.get_from_cache(key)
    Rails.cache.fetch("course_offering/#{key}", force: !should_cache?) do
      CourseOffering.find_by_key(key)
    end
  end

  # All course versions in a course offering should have the same instructor audience
  def can_be_instructor?(user)
    course_versions.any? {|cv| cv.can_be_instructor?(user)}
  end

  def any_versions_launched?
    course_versions.any?(&:launched?)
  end

  def any_versions_in_development?
    course_versions.any?(&:in_development?)
  end

  def any_version_is_assignable_pilot?(user)
    course_versions.any? {|cv| cv.pilot? && cv.has_pilot_experiment?(user)}
  end

  def any_version_is_assignable_editor_experiment?(user)
    course_versions.any? {|cv| cv.content_root.is_a?(Unit) && cv.has_editor_experiment?(user)}
  end

  # Checks if any course version has a published_state of 'preview' or 'stable'
  def any_version_is_in_published_state?
    published_states = ['preview', 'stable']
    course_versions.any? {|cv| published_states.include?(cv.published_state)}
  end

  def self.all_course_offerings
    if should_cache?
      @@course_offerings ||= CourseOffering.all.includes(
        course_versions: {
          content_root: {
            default_unit_group_units: {}
          }
        }
      )
    else
      CourseOffering.all.includes(
        course_versions: {
          content_root: {
            default_unit_group_units: {}
          }
        }
      )
    end
  end

  # We only want course offerings that are:
  # - Assignable (course offering 'assignable' setting is true)
  # - Published (associated unit group or unit 'published_state' setting is 'preview' or 'stable')
  # - For students (associated unit group or unit 'participant_audience' setting is student)
  def self.assignable_published_for_students_course_offerings
    all_course_offerings.select {|co| co.assignable? && co.any_version_is_in_published_state? && co.get_participant_audience == 'student'}
  end

  def self.assignable_course_offerings(user)
    all_course_offerings.select {|co| co.can_be_assigned?(user)}
  end

  def self.assignable_course_offerings_info(user, locale_code = 'en-us')
    assignable_course_offerings(user).map {|co| co.summarize_for_assignment_dropdown(user, locale_code)}.to_h
  end

  def self.self_paced_pl_course_offerings
    all_course_offerings.select {|co| co.get_participant_audience == 'teacher' && co.instruction_type == 'self_paced'}
  end

  def self.self_paced_pl_course_offerings_basic_info
    self_paced_pl_course_offerings.map do |co|
      {
        id: co.id,
        key: co.key,
        display_name: co.display_name,
      }
    end
  end

  def self.self_paced_course_offerings_for_catalog
    all_course_offerings.select do |co|
      co.get_participant_audience == 'teacher' &&
        co.instruction_type == 'self_paced' &&
        co.assignable? &&
        co.any_version_is_in_published_state?
    end.map(&:summarize_for_catalog)
  end

  def self.self_paced_pl_course_offerings_for_workshops
    participant_audiences = ['teacher', 'facilitator']
    all_course_offerings.select do |co|
      participant_audiences.include?(co.get_participant_audience) &&
        co.instruction_type == 'self_paced' &&
        co.header.present? &&
        co.any_version_is_in_published_state?
    end&.map(&:summarize_self_paced_pl)
  end

  def summarize_for_unit_selector(unit_ids)
    {
      display_name: any_versions_launched? ? localized_display_name : localized_display_name + ' *',
      units: course_versions.map(&:units).flatten.select {|u| u.included_in_units?(unit_ids)}.map(&:summarize_for_unit_selector).sort_by {|u| -1 * u[:version_year].to_i}
    }
  end

  def can_be_assigned?(user)
    return false unless assignable?
    return false unless can_be_instructor?(user)
    return true if any_versions_launched?
    return true if any_version_is_assignable_pilot?(user)
    return true if any_version_is_assignable_editor_experiment?(user)
    return true if user.permission?(UserPermission::LEVELBUILDER)

    false
  end

  # Checks if the course offering requires device compatibilities and is missing any.
  def missing_required_device_compatibility?
    # Only student course offerings require device compatibilites to be published.
    return false if get_participant_audience != 'student'
    return true if device_compatibility.nil?

    device_compatibility_values = JSON.parse(device_compatibility).values
    device_compatibility_values.any?(&:blank?)
  end

  def summarize_for_assignment_dropdown(user, locale_code)
    [
      id,
      {
        id: id,
        display_name: any_versions_launched? ? localized_display_name : localized_display_name + ' *',
        is_featured: is_featured?,
        participant_audience: course_versions.first.content_root.participant_audience,
        course_versions: course_versions.select {|cv| cv.course_assignable?(user)}.map {|cv| cv.summarize_for_assignment_dropdown(user, locale_code)}.to_h
      }
    ]
  end

  def summarize_for_quick_assign(user, locale_code)
    {
      id: id,
      key: key,
      display_name: any_versions_launched? ? localized_display_name : localized_display_name + ' *',
      course_versions: course_versions.select {|cv| cv.course_assignable?(user)}.map {|cv| cv.summarize_for_assignment_dropdown(user, locale_code)},
      ai_teaching_assistant_available: ai_teaching_assistant_available,
    }
  end

  def summarize_self_paced_pl
    {
      id: id,
      display_name: display_name_with_latest_year
    }
  end

  def duration_in_minutes
    return nil unless latest_published_version
    co_units = latest_published_version.units
    co_units.sum(&:duration_in_minutes)
  end

  def duration_in_hours
    return nil unless duration_in_minutes
    duration_in_minutes > 60 ? duration_in_minutes / 60 : 1
  end

  def duration
    return nil unless duration_in_minutes
    DURATION_LABEL_TO_MINUTES_CAP.keys.find {|dur| duration_in_minutes <= DURATION_LABEL_TO_MINUTES_CAP[dur]}
  end

  def translated?(locale_code = 'en-us')
    locale_str = locale_code&.to_s
    return true if locale_str&.start_with?('en')

    latest_stable_version = UnitGroup.latest_stable_version(key, locale: locale_str)
    !latest_stable_version.nil?
  end

  def upcoming_facilitated_workshops
    return [] if pd_workshops.blank?

    workshops = pd_workshops.select do |ws|
      !ws.hidden &&
        ws.sessions.any? &&
        ws.sessions.first.start > Time.zone.now
    end

    workshops.sort_by {|ws| ws.sessions.first.start}
  end

  def summarize_for_edit
    {
      key: key,
      is_featured: is_featured?,
      display_name: display_name,
      assignable: assignable?,
      curriculum_type: curriculum_type,
      marketing_initiative:  marketing_initiative,
      grade_levels: grade_levels,
      header: header,
      image: image,
      cs_topic: cs_topic,
      school_subject: school_subject,
      device_compatibility: device_compatibility,
      description: description,
      professional_learning_program: professional_learning_program,
      video: video,
      published_date: published_date,
      self_paced_pl_course_offering_id: self_paced_pl_course_offering_id,
      ai_teaching_assistant_available: ai_teaching_assistant_available,
      facilitator_course_permissions: facilitator_course_permissions || [],
    }
  end

  def summarize_for_catalog(locale_code = 'en-us')
    {
      key: key,
      display_name: localized_display_name,
      display_name_with_latest_year: display_name_with_latest_year(locale_code),
      marketing_initiative: marketing_initiative,
      grade_levels: grade_levels,
      duration: duration,
      duration_in_hours: duration_in_hours,
      image: image,
      cs_topic: cs_topic,
      school_subject: school_subject,
      device_compatibility: device_compatibility,
      course_version_path: path_to_latest_published_version(locale_code),
      course_version_id: latest_published_version(locale_code)&.id,
      course_id: course_id,
      course_offering_id: id,
      is_translated: translated?(locale_code),
      description: localized_description,
      professional_learning_program: professional_learning_program,
      video: video,
      published_date: published_date,
      self_paced_pl_course_offering_path: self_paced_pl_course_offering&.path_to_latest_published_version(locale_code),
      available_resources: get_available_resources(locale_code),
      facilitated_workshops: Array(upcoming_facilitated_workshops).map(&:summarize_for_pl_catalog)
    }
  end

  def serialize
    {
      key: key,
      display_name: display_name,
      is_featured: is_featured,
      assignable: assignable?,
      curriculum_type: curriculum_type,
      marketing_initiative: marketing_initiative,
      grade_levels: grade_levels,
      header: header,
      image: image,
      cs_topic: cs_topic,
      school_subject: school_subject,
      device_compatibility: device_compatibility,
      description: description,
      professional_learning_program: professional_learning_program,
      video: video,
      published_date: published_date,
      self_paced_pl_course_offering_key: self_paced_pl_course_offering&.key,
      ai_teaching_assistant_available: ai_teaching_assistant_available,
      facilitator_course_permissions: facilitator_course_permissions
    }
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    file_path = Rails.root.join("config/course_offerings/#{key}.json")
    object_to_serialize = serialize
    File.write(file_path, JSON.pretty_generate(object_to_serialize) + "\n")
  end

  def self.seed_all(root_dir: Rails.root, glob: "config/course_offerings/*.json")
    removed_records = all.pluck(:key)
    Dir.glob(root_dir.join(glob)).each do |path|
      removed_records -= [CourseOffering.seed_record(path)]
    end
    where(key: removed_records).destroy_all
  end

  def self.properties_from_file(content)
    config = JSON.parse(content)
    config.symbolize_keys
  end

  # Returns the course offering key to help in removing records
  # that are no longer in use during the seeding process. See
  # seed_all
  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    key = properties[:self_paced_pl_course_offering_key]
    new_self_paced_pl_course_offering = CourseOffering.find_by_key(key)
    if new_self_paced_pl_course_offering.nil? && !key.nil?
      warn "self_paced_pl_course_offering_key: #{key} not found. Please seed again to fix."
    else
      properties[:self_paced_pl_course_offering_id] = new_self_paced_pl_course_offering&.id
    end
    properties.delete(:self_paced_pl_course_offering_key)
    course_offering = CourseOffering.find_or_initialize_by(key: properties[:key])
    course_offering.update! properties
    course_offering.key
  end

  def units_included_in_any_version?(unit_ids)
    course_versions.any? {|cv| cv.included_in_units?(unit_ids)}
  end

  def csd?
    key == 'csd'
  end

  def hoc?
    marketing_initiative == Curriculum::SharedCourseConstants::COURSE_OFFERING_MARKETING_INITIATIVES.hoc
  end

  def hoai?
    marketing_initiative == Curriculum::SharedCourseConstants::COURSE_OFFERING_MARKETING_INITIATIVES.hoai
  end

  def hoc_or_hoai?
    hoc? || hoai?
  end

  def pl_course?
    !!course_versions&.first&.pl_course?
  end

  def get_participant_audience
    course_versions&.first&.content_root&.participant_audience
  end

  def instruction_type
    course_versions&.first&.content_root&.instruction_type
  end

  def grade_levels_list
    return [] if grade_levels.nil?
    grade_levels.strip.split(',')
  end

  def elementary_school_level?
    grade_levels_list.any? {|g| ELEMENTARY_SCHOOL_GRADES.include?(g)}
  end

  def middle_school_level?
    grade_levels_list.any? {|g| MIDDLE_SCHOOL_GRADES.include?(g)}
  end

  def high_school_level?
    grade_levels_list.any? {|g| HIGH_SCHOOL_GRADES.include?(g)}
  end

  def find_corresponding_offerings_for_pl_course
    return unless pl_course?

    CourseOffering.where(self_paced_pl_course_offering_id: id)
  end

  def pl_for_elementary_school?
    return false unless pl_course?

    find_corresponding_offerings_for_pl_course.any?(&:elementary_school_level?)
  end

  def get_available_resources(locale_code = 'en-us')
    latest_version = latest_published_version(locale_code)
    unit = latest_version&.units&.first
    unit_group_unit = unit&.unit_group_units&.first
    lessons = unit&.lessons

    return nil unless lessons
    expanded_card_resources = {}

    lessons.each do |lesson|
      break if expanded_card_resources.size >= 5
      if lesson.has_lesson_plan
        expanded_card_resources["Lesson Plan"] ||= lesson.lesson_plan_html_url(unit_group_unit: unit_group_unit)
      end
      lesson.resources&.each do |resource|
        properties = resource.properties
        next unless properties&.key?('type')
        type = properties['type']
        type = "Slide Deck" if type == "Slides"
        type = "Answer Key" if type == "Exemplar"
        if ACCEPTABLE_RESOURCE_TYPES.include?(type) && !expanded_card_resources.key?(type)
          expanded_card_resources[type] ||= resource["url"]
        end
      end
    end
    expanded_card_resources
  end

  private def grade_levels_format
    return true if grade_levels.nil?

    grade_levels_regex = /^[K|\d]+(,?\d)*$/
    unless grade_levels_regex.match?(grade_levels)
      errors.add(:grade_levels, "must be comma-separated values with optional K first and digits")
      return false
    end

    array_of_grades = grade_levels.split(',')

    unless array_of_grades.length == array_of_grades.uniq.length
      errors.add(:grade_levels, "cannot contain duplicate grades")
      return false
    end

    array_of_grades.delete("K")
    return true if array_of_grades.empty?

    array_of_integer_grades = array_of_grades.map(&:to_i)
    unless array_of_integer_grades.all? {|grade| (1..12).cover?(grade)}
      errors.add(:grade_levels, "numbers must be between 1 and 12, inclusive")
      return false
    end

    unless array_of_integer_grades == (array_of_integer_grades.first..array_of_integer_grades.last).to_a
      errors.add(:grade_levels, "must be consecutive and sorted")
      return false
    end

    true
  end
end
