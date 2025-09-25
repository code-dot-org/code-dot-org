module User::Age
  extend ActiveSupport::Concern
  include User::ProviderFlags

  included do
    AGE_DROPDOWN_OPTIONS = (4..20).to_a << "21+"

    defer_age = proc {|user| %w(google_oauth2 clever).include?(user.provider) || user.sponsored? || Policies::Lti.lti?(user)}
    validates :age, presence: true, on: :create, unless: defer_age # only do this on create to avoid problems with existing users
    validates :age, presence: false, inclusion: {in: AGE_DROPDOWN_OPTIONS}, allow_blank: true
  end

  # There are some shenanigans going on with this age stuff. The
  # actual persisted column is birthday -- so we convert age to a
  # birthday when writing and convert birthday to an age when
  # reading. However -- when we are generating error messages for the
  # user on an unsaved record, we actually 'read' and 'write' the
  # attribute via these accessors. @age is a non-persisted member that
  # we use to save the (possibly invalid) value that the user entered
  # for age so we can generate the correct error message.

  def age=(val)
    @age = val
    val = begin
      val.to_i
    rescue
      0 # sometimes we get age: {"Pr" => nil}
    end
    return unless val > 0
    return unless val < 200
    return if birthday && val == age # don't change birthday if we want to stay the same age

    self.birthday = val.years.ago
  end

  def age
    return @age unless birthday
    age = UserHelpers.age_from_birthday(birthday)
    if age < 4
      age = nil
    elsif age >= 21
      age = '21+'
    end
    age
  end

  # Duplicated by under_13? in auth_helpers.rb, which doesn't use the rails model.
  def under_13?
    age.nil? || age.to_i < 13
  end

  def over_21?
    !age.nil? && age.to_i >= 21
  end
end
