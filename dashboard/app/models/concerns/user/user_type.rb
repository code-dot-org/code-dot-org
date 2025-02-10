module User::UserType
  extend ActiveSupport::Concern

  def student?
    Policies::User::UserType.new(self).student?
  end

  def teacher?
    Policies::User::UserType.new(self).teacher?
  end
end
