# == Schema Information
#
# Table name: studio_people
#
#  id         :integer          not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  emails     :string(255)
#

require 'cdo/firehose'

class StudioPerson < ActiveRecord::Base
  has_many :users

  # Returns the emails associated with the StudioPerson as an array.
  # @returns [Array[String]] An array of emails associated with the studio_person.
  def emails_as_array
    return [] if emails.nil?
    emails.split(',')
  end

  # Merges two StudioPersons into one StudioPerson, logging the event to Firehose. In doing so,
  # deletes a StudioPerson.
  # @param [StudioPerson] studio_person_a The first StudioPerson.
  # @param [StudioPerson] studio_person_b The second StudioPerson.
  # @raise [ArgumentError] If the StudioPersons are not distinct.
  def self.merge(studio_person_a, studio_person_b)
    raise ArgumentError.new('StudioPersons must be distinct') if studio_person_a == studio_person_b

    users_a = User.where(studio_person_id: studio_person_a.id).pluck(:id)
    users_b = User.where(studio_person_id: studio_person_b.id).pluck(:id)

    # Arbitrarily, we merge the two StudioPersons into studio_person_a.
    merged_emails_array = (studio_person_a.emails_as_array + studio_person_b.emails_as_array).uniq
    studio_person_a.update!(emails: merged_emails_array.join(','))
    unless users_b.empty?
      User.where(studio_person_id: studio_person_b.id).each do |user|
        user.update!(studio_person_id: studio_person_a.id)
      end
    end

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'studio_person_audit',
        event: 'studio_person_merge',
        data_json: {
          studio_person_a_id: studio_person_a.id,
          studio_person_b_id: studio_person_b.id,
          studio_person_merged_id: studio_person_a.id,
          user_a_id: users_a,
          user_b_id: users_b
        }.to_json
      }
    )

    # Delete the now orphaned StudioPerson.
    studio_person_b.destroy!
  end

  # Splits a StudioPerson into multiple StudioPersons, logging the event to Firehose.
  # @raise [ArgumentError] If the StudioPerson does not have two associated emails, if more than two
  #   people share the StudioPerson.
  def self.split(studio_person)
    unless studio_person.emails_as_array.count == 2
      raise ArgumentError.new("StudioPerson does not have exactly two emails")
    end

    users = User.where(studio_person_id: studio_person.id).all
    unless users.count == 2
      raise ArgumentError.new("StudioPerson not shared by two users (#{users.count})")
    end
    if users.first.email.blank? || users.second.email.blank?
      raise ArgumentError.new('user is missing an email address')
    end

    # Arbitrarily, we modify studio_person for users.first and create a new StudioPerson for
    # users.second.
    studio_person.update!(emails: users.first.email)
    users.second.update!(studio_person: StudioPerson.create!(emails: users.second.email))

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'studio_person_audit',
        event: 'studio_person_split',
        data_json: {
          combined_studio_person_id: studio_person.id,
          studio_person_a_id: users.first.studio_person_id,
          studio_person_b_id: users.second.studio_person_id,
          user_a_id: users.first.id,
          user_b_id: users.second.id
        }.to_json
      }
    )
  end

  # Adds email to the list of emails contained within emails and logs the event to Firehose.
  # @param email [String] The email to associate with this studio_person.
  # @raises [ArgumentError] If the email address is associated with another user.
  def add_email_to_emails(email)
    return if email.nil? || email.blank?

    normalized_email = email.strip.downcase
    return if emails_as_array.include? normalized_email
    update!(emails: (emails_as_array << normalized_email).join(','))

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'studio_person_audit',
        event: 'studio_person_add_email_to_emails',
        data_json: {
          studio_person_id: id,
          new_email: email,
          emails: emails
        }
      }
    )
  end
end
