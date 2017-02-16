# == Schema Information
#
# Table name: sections
#
#  id           :integer          not null, primary key
#  user_id      :integer          not null
#  name         :string(255)
#  created_at   :datetime
#  updated_at   :datetime
#  code         :string(255)
#  script_id    :integer
#  grade        :string(255)
#  admin_code   :string(255)
#  login_type   :string(255)      default("email"), not null
#  deleted_at   :datetime
#  stage_extras :boolean          default(FALSE), not null
#  section_type :string(255)
#
# Indexes
#
#  index_sections_on_code     (code) UNIQUE
#  index_sections_on_user_id  (user_id)
#

require 'cdo/section_helpers'

require 'full-name-splitter'
require 'rambling-trie'

class Section < ActiveRecord::Base
  belongs_to :user

  has_many :followers, dependent: :restrict_with_error
  accepts_nested_attributes_for :followers

  has_many :students, -> { order('name')}, through: :followers, source: :student_user
  accepts_nested_attributes_for :students

  validates :name, presence: true

  belongs_to :script

  has_many :section_hidden_stages

  LOGIN_TYPE_PICTURE = 'picture'
  LOGIN_TYPE_WORD = 'word'

  TYPES = [
    # Insert non-workshop section types here.
  ].concat(Pd::Workshop::SECTION_TYPES).freeze
  validates_inclusion_of :section_type, in: TYPES, allow_nil: true

  def workshop_section?
    Pd::Workshop::SECTION_TYPES.include? section_type
  end

  def user_must_be_teacher
    errors.add(:user_id, "must be a teacher") unless user.user_type == User::TYPE_TEACHER
  end
  validate :user_must_be_teacher

  before_create :assign_code
  def assign_code
    self.code = unused_random_code
  end

  def teacher_dashboard_url
    CDO.code_org_url "/teacher-dashboard#/sections/#{id}/manage", 'https:'
  end

  # return a version of self.students in which all students' names are
  # shortened to their first name (if unique) or their first name plus
  # the minimum number of letters in their last name needed to uniquely
  # identify them
  def name_safe_students
    # Create a prefix tree of student names
    trie = Rambling::Trie.create

    # Add whitespace-normalized versions of the student names to the
    # trie. Because FullNameSplitter implicitly performs whitespace
    # normalization, this is necessary to ensure that we can recognize
    # the name on the other side
    self.students.each do |student|
      student.name = student.name.strip.split(/\s+/).join(' ')
      trie.add student.name
    end

    self.students.map do |student|
      first, _last = FullNameSplitter.split(student.name)
      if first.nil?
        # if fullnamesplitter can't identify the first name, default to
        # full name (ie do nothing)
      elsif first.length == 1 || /^.\.$/.match(first)
        # if the students first name is either a single character or a
        # single character followed by a period, assume it has been
        # abbreviated and display the full name
      elsif trie.words(first).count == 1
        # If the student's first name is unique, simply use that
        student.name = first
      else
        # Otherwise, we first must find the leaf node representing the
        # student's entire name
        leaf = trie.root
        student.name.split('').each do |letter|
          leaf = leaf[letter.to_sym]
        end

        # we then traverse up the trie until we encounter the
        # "rightmost" letter in the student's name which is not unique.
        # "Not unique" means that either the letter has siblings
        # (implying other names that share characters with our own) or
        # its parent is a terminal node (implying a name that's a strict
        # subset of our own)
        leaf = leaf.parent until leaf.parent.nil? ||
            leaf.parent.children.count > 1 ||
            leaf.parent.terminal?

        # If our "rightmost" character is a space, add an additional
        # letter for visibility if we can. Note that by this stage we
        # are guaranteed to have no more than one child, so we can
        # condifently pick the first.
        leaf = leaf.children.first if leaf.children.any? && leaf.letter == :" "

        # finally, we assemble the student's unique name by continuing
        # our way up the trie
        newname = ""
        until leaf.nil?
          newname = leaf.letter.to_s + newname
          leaf = leaf.parent
        end
        student.name = newname unless newname.empty?
      end

      student
    end
  end

  def students_attributes=(params)
    follower_params = params.collect do |student|
      {
        user_id: user.id,
        student_user_attributes: student
      }
    end

    self.followers_attributes = follower_params
  end

  def add_student(student, move_for_same_teacher: true)
    if move_for_same_teacher && (follower = student.followeds.find_by(user_id: user_id))
      # if this student is already in another section owned by the
      # same teacher, move them to this section instead of creating a
      # new one
      follower.update_attributes!(section: self)
    else
      follower = Follower.find_or_create_by!(user_id: user_id, student_user: student, section: self)
    end
    follower
  end

  def teacher
    user
  end

  private

  def unused_random_code
    loop do
      code = SectionHelpers.random_code
      return code unless Section.exists?(code: code)
    end
  end
end
