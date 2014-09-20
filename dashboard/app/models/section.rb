class Section < ActiveRecord::Base
  belongs_to :user

  has_many :followers, dependent: :restrict_with_error
  accepts_nested_attributes_for :followers
  
  has_many :students, through: :followers, source: :student_user
  accepts_nested_attributes_for :students

  validates :name, presence: true

  belongs_to :script

  LOGIN_TYPE_PICTURE = 'picture'
  LOGIN_TYPE_WORD = 'word'

  def user_must_be_teacher
    errors.add(:user_id, "must be a teacher") unless user.user_type == User::TYPE_TEACHER
  end
  validate :user_must_be_teacher

  before_create :assign_code
  def assign_code
    self.code = random_code
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

  private
  CHARS = ("A".."Z").to_a
  def random_text(len)
    len.times.to_a.collect{ CHARS.sample }.join
  end

  def random_code
    loop do 
      code = random_text(6)
      return code unless Section.exists?(code: code)
    end 
  end
end
