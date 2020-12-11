# == Schema Information
#
# Table name: resources
#
#  id                :integer          not null, primary key
#  name              :string(255)
#  url               :string(255)      not null
#  key               :string(255)      not null
#  properties        :string(255)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  course_version_id :integer          not null
#
# Indexes
#
#  index_resources_on_course_version_id_and_key  (course_version_id,key) UNIQUE
#  index_resources_on_name_and_url               (name,url)
#

# A Resource represents a link to external material for a lesson
#
# @attr [String] name - The user-visisble name of the resource
# @attr [String] url - The URL pointing to the resource
# @attr [String] key - A unique identifier for the resource
# @attr [String] type - type of resource (eg video, handout, etc)
# @attr [Boolean] assessment - indicates whether this resource is an assessment
# @attr [String] audience - who this resource is targeted toward (eg teacher, student, etc)
# @attr [String] download_url - URL that can download the file
# @attr [Boolean] include_in_pdf - indicates whether the file will be included in a PDF handout
class Resource < ApplicationRecord
  include SerializedProperties

  has_and_belongs_to_many :lessons, join_table: :lessons_resources
  belongs_to :course_version

  before_validation :generate_key, on: :create

  serialized_attrs %w(
    type
    assessment
    audience
    download_url
    include_in_pdf
  )

  def generate_key
    return if key
    self.key = generate_key_from_name
  end

  def summarize_for_lesson_plan
    {
      key: key,
      name: I18n.t("data.resource.#{key}.name", default: name),
      url: url,
      download_url: download_url,
      audience: audience || 'All',
      type: type
    }
  end

  def summarize_for_lesson_edit
    {
      id: id,
      key: key,
      name: name,
      url: url,
      downloadUrl: download_url || '',
      audience: audience || '',
      type: type || '',
      assessment: assessment || false,
      includeInPdf: include_in_pdf || false
    }
  end

  private

  def generate_key_from_name
    key_prefix = name.strip.downcase.gsub(/[^a-z0-9\-\_\.]+/, '_')
    potential_clashes = course_version_id ? Resource.where(course_version_id: course_version_id) : Resource.all
    potential_clashes = potential_clashes.where("resources.key like '#{key_prefix}%'").pluck(:key)
    return key_prefix unless potential_clashes.include?(key_prefix)
    key_suffix_num = 1
    new_key = key_prefix
    while potential_clashes.include?(new_key)
      new_key = "#{key_prefix}_#{key_suffix_num}"
      key_suffix_num += 1
    end
    new_key
  end
end
