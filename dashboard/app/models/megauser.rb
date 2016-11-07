# == Schema Information
#
# Table name: megausers
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  emails     :string(255)
#

require 'digest/md5'

class Megauser < ActiveRecord::Base
  has_many :users

  # Associates a new or existing (from the point of view of Code Studio users)
  # email with this user. If new, adds it to the list of emails. If existing,
  # links the associated user (as well as all users associated with the user)
  # to this user (removing the duplicate megauser if necessary).
  # @param email [String] The email address to associate with this megauser.
  def add_email(email)
    add_email_to_emails(email)

    # Look for whether there is a User and a Person for the email address.
    existing_user = User.find_by_email_or_hashed_email(email)
    existing_megauser = existing_user.megauser if existing_user
    # Merge the existing user, if any, with this megauser.
    if existing_user
      existing_user.update!(megauser_id: self.id)
    end

    # Merge the existing megauser (also all associated users), if any, with this
    # megauser.
    if existing_megauser && self != existing_megauser
      existing_megauser.emails_as_array.each do |existing_email|
        add_email_to_emails(existing_email)
      end
      User.where(megauser_id: existing_megauser.id).each do |user|
        # TODO(asher): If necessary, bypass validations as many of our users do
        # not pass our own validations.
        user.update!(megauser_id: self.id)
        add_email_to_emails(user.email)
      end
    end

    self.save!
    # Delete the (now) orphaned megauser.
    existing_megauser.delete if existing_megauser
  end

  # @returns [Array[String]] An array of emails associated with the megauser.
  def emails_as_array
    return [] if emails.nil?
    self.emails.split(',')
  end

  private

  # Adds email to the list of emails contained within emails.
  # NOTE: This does NOT save the change.
  # @param email [String] The email to associate with this megauser.
  def add_email_to_emails(email)
    return if email.nil? || email.blank?
    return if emails_as_array.include? email
    self.emails = (emails_as_array << email).join(',')
  end
end
