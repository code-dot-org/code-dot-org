# == Schema Information
#
# Table name: studio_people
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  emails     :string(255)
#

class StudioPerson < ActiveRecord::Base
  has_many :users

  # Associates a new or existing (from the point of view of Code Studio users)
  # email with this user. If new, adds it to the list of emails. If existing,
  # links the associated user (as well as all users associated with the user)
  # to this user (removing the duplicate studio_person if necessary).
  #
  # WARNING: As this method stores emails in plaintext, the email argument
  # should include only teacher emails.
  #
  # @param email_to_add [String] The email address to associate with this
  #   studio_person.
  def add_email(email_to_add)
    add_email_to_emails(email_to_add)

    # Look for whether there is (are) a User and a StudioPerson for the email
    # address. By using hashed_email, we handle the many teachers missing a
    # plaintext email.
    hashed_email_to_add = User.hash_email(email_to_add)
    User.where(hashed_email: hashed_email_to_add).each do |matching_user|
      matching_studio_person = matching_user.studio_person
      begin
        matching_user.update!(studio_person_id: self.id)
      rescue
        matching_user.update!(studio_person_id: self.id, email: email_to_add)
      end

      # Merge the matching studio_person (also all associated users), if any,
      # with this studio_person.
      if self != matching_studio_person
        matching_studio_person.emails_as_array.each do |existing_email|
          add_email_to_emails(existing_email)
        end
        User.where(studio_person_id: matching_studio_person.id).each do |user|
          # TODO(asher): If necessary, bypass validations as many of our users do
          # not pass our own validations.
          user.update!(studio_person_id: self.id)
          add_email_to_emails(user.email)
        end
      end

      # Delete the (now) orphaned studio_person.
      matching_studio_person.delete if matching_studio_person
    end

    self.save!
  end

  # @returns [Array[String]] An array of emails associated with the studio_person.
  def emails_as_array
    return [] if emails.nil?
    self.emails.split(',')
  end

  private

  # Adds email to the list of emails contained within emails.
  # NOTE: This does NOT save the change.
  # @param email [String] The email to associate with this studio_person.
  def add_email_to_emails(email)
    return if email.nil? || email.blank?

    normalized_email = email.strip.downcase
    return if emails_as_array.include? normalized_email
    self.emails = (emails_as_array << normalized_email).join(',')
  end
end
