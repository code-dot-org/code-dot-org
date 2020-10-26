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
#  course_version_id :integer
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

  serialized_attrs %w(
    type
    assessment
    audience
    download_url
    include_in_pdf
  )
end
