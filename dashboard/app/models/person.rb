require 'digest/md5'

class Person < ActiveRecord::Base
  has_many :users

  # Associates a new or existing (from the point of view of Code Studio users)
  # email with this person. If new, adds it to the list of emails. If existing,
  # links the associated user (as well as all users associated with the person)
  # to this person (removing the duplicate person if necessary).
  # @param email [String] The email address to associate with this person.
  def add_email(email)
    add_email_to_emails(email)

    # Look for whether there is a User and a Person for the email address.
    hashed_email = Digest::MD5.hexdigest(email)
    existing_user = User.find_by_email_or_hashed_email(hashed_email)
    existing_person = existing_user.person if existing_user
    # Merge the existing user, if any, with this person.
    if existing_user
      existing_user.update!(person_id: self.person_id)
    end

    # Merge the existing person (also all associated users), if any, with this
    # person.
    if existing_person && self != existing_person
      existing_person.emails_as_array.each do |existing_email|
        add_email_to_emails(existing_email)
      end
      User.where(person_id: existing_person.id).each do |user|
        # TODO(asher): If necessary, bypass validations as many of our users do
        # not pass our own validations.
        user.update!(person_id: self.person_id)
        add_email_to_emails(user.email)
      end
    end

    self.save!
    # Delete the (now) orphaned person.
    existing_person.delete! if existing_person
  end

  # @returns [Array[String]] An array of emails associated with the person.
  def emails_as_array
    return [] if emails.nil?
    self.emails.split(',')
  end

  private

  # Adds email to the list of emails contained within emails.
  # NOTE: This does NOT save the change.
  # @param email [String] The email to associate with this person.
  def add_email_to_emails(email)
    return if email.nil? || email.blank?
    return if emails_as_array.include? email
    self.emails = (emails_as_array << email).join(',')
  end
end
