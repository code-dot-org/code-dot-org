# == Schema Information
#
# Table name: programming_methods
#
#  id                   :bigint           not null, primary key
#  programming_class_id :integer
#  key                  :string(255)
#  position             :integer
#  name                 :string(255)
#  content              :text(65535)
#  parameters           :text(65535)
#  examples             :text(65535)
#  syntax               :string(255)
#  external_link        :string(255)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  overloaded_by        :string(255)
#
# Indexes
#
#  index_programming_methods_on_key_and_programming_class_id  (key,programming_class_id) UNIQUE
#
class ProgrammingMethod < ApplicationRecord
  include CurriculumHelper

  belongs_to :programming_class

  before_validation :generate_key, on: :create
  validates_uniqueness_of :key, scope: :programming_class_id, case_sensitive: false
  validate :validate_key_format

  def generate_key
    return key if key
    key = ProgrammingMethod.sanitize_key(name)
    self.key = key
  end

  # Sanitize a string so that it conforms to key requirements
  # We're using KEY_CHAR_RE from CurriculumHelper here except that paranthesis
  # should have special handling. So, for example, turnLeft() should be turnleft
  # and moveForward(int n) should be moveforward-int-n
  def self.sanitize_key(str)
    str = str.tr('(', ' ').tr(')', ' ').strip
    str.downcase.chars.map do |character|
      KEY_CHAR_RE.match(character) ? character : '_'
    end.join.gsub(/_+/, '-')
  end

  def serialize
    attributes.except('id', 'programming_class_id', 'created_at', 'updated_at')
  end
end
