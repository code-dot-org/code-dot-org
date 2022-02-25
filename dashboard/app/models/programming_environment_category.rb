# == Schema Information
#
# Table name: programming_environment_categories
#
#  id                         :bigint           not null, primary key
#  programming_environment_id :integer          not null
#  key                        :string(255)      not null
#  name                       :string(255)
#  color                      :string(255)
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  position                   :integer
#
# Indexes
#
#  index_programming_environment_categories_on_environment_id  (programming_environment_id)
#  index_programming_environment_categories_on_key_and_env_id  (key,programming_environment_id) UNIQUE
#
class ProgrammingEnvironmentCategory < ApplicationRecord
  belongs_to :programming_environment
  has_many :programming_expressions, dependent: :restrict_with_error

  KEY_CHAR_RE = /[a-z_]/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  validates_format_of :key,
    with: KEY_RE,
    message: "must contain only lowercase alphabetic characters and underscores; got \"%{value}\"."

  before_validation :generate_key, on: :create

  def serialize
    {
      key: key,
      name: name,
      color: color
    }
  end

  def serialize_for_edit
    {
      id: id,
      key: key,
      name: name,
      color: color,
      deletable: programming_expressions.count == 0
    }
  end

  def summarize_for_environment_show
    {
      key: key,
      name: name,
      color: color,
      programmingExpressions: programming_expressions.map(&:serialize_for_environment_show)
    }
  end

  def generate_key
    return key if key
    key = ProgrammingEnvironmentCategory.sanitize_key(name)
    self.key = key
  end

  def self.sanitize_key(key)
    key.strip.downcase.chars.map do |character|
      KEY_CHAR_RE.match(character) ? character : '_'
    end.join.gsub(/_+/, '_')
  end
end
