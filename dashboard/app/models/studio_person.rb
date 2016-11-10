# == Schema Information
#
# Table name: studio_people
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  emails     :string(255)
#

require 'digest/md5'

class StudioPerson < ActiveRecord::Base
  has_many :users

  # Associates a new or existing (from the point of view of Code Studio users)
  # email with this user. If new, adds it to the list of emails. If existing,
  # links the associated user (as well as all users associated with the user)
  # to this user (removing the duplicate studio_person if necessary).
  # @param email [String] The email address to associate with this
  #   studio_person.
  def add_email(email)
    add_email_to_emails(email)

    # Look for whether there is a User and a StudioPerson for the email address.
    existing_user = User.find_by_email_or_hashed_email(email)
    existing_studio_person = existing_user.studio_person if existing_user
    # Merge the existing user, if any, with this studio_person.
    if existing_user
      existing_user.update!(studio_person_id: self.id)
    end

    # Merge the existing studio_person (also all associated users), if any, with
    # this studio_person.
    if existing_studio_person && self != existing_studio_person
      existing_studio_person.emails_as_array.each do |existing_email|
        add_email_to_emails(existing_email)
      end
      User.where(studio_person_id: existing_studio_person.id).each do |user|
        # TODO(asher): If necessary, bypass validations as many of our users do
        # not pass our own validations.
        user.update!(studio_person_id: self.id)
        add_email_to_emails(user.email)
      end
    end

    self.save!
    # Delete the (now) orphaned studio_person.
    existing_studio_person.delete if existing_studio_person
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
    return if emails_as_array.include? email
    self.emails = (emails_as_array << email).join(',')
  end
end
