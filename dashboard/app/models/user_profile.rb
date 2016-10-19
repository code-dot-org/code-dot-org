# == Schema Information
#
# Table name: user_profiles
#
#  id             :integer          not null, primary key
#  user_id        :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  updated_by     :integer
#  other_user_ids :string(255)
#  other_emails   :string(255)
#  course         :string(255)
#  pd             :string(255)
#  pd_manual      :string(255)
#  properties     :text(65535)
#
# Indexes
#
#  index_user_profiles_on_user_id  (user_id)
#

require 'digest/md5'

class UserProfile < ActiveRecord::Base
  belongs_to :user

  include SerializedProperties
  # facilitator: True if the user is a Code.org facilitator.
  # nmsi: True if the user was PDed through NMSI (https://www.nms.org/AboutNMSI.aspx).
  # teals: True if the user was PDed through TEALS (www.tealsk12.org).
  serialized_attrs %w(facilitator nmsi teals)

  YEARS = [
    YEAR_2013_2014 = '2013-2014'.freeze,
    YEAR_2014_2015 = '2014-2015'.freeze,
    YEAR_2015_2016 = '2015-2016'.freeze,
    YEAR_2016_2017 = '2016-2017'.freeze,
  ].freeze
  NO_PD = 'no_pd'.freeze
  validates_inclusion_of :pd, in: YEARS, allow_nil: true
  validates_inclusion_of :pd_manual, in: YEARS + [NO_PD], allow_nil: true

  COURSES = [
    CSD = 'csd'.freeze,
    CSF = 'csf'.freeze,
    CSP = 'csp'.freeze,
    ECS = 'ecs'.freeze
  ].freeze
  # TODO(asher): Change the DB to enforce course to be non-null. Add a unique
  #   index on (user_id, course).
  validates_inclusion_of :course, in: COURSES

  # The field other_user_ids is a comma-separated list of alternate Code Studio
  # IDs for the user.

  # @returns [Array[Integer]] an array of alternate user IDs for the user.
  def get_other_user_ids
    return [] if other_user_ids.nil?
    other_user_ids.split(',').map(&:to_i)
  end

  # @param alternate_user_id [Integer] an alternate user_id for the user.
  def add_other_user_id(alternate_user_id)
    existing_other_user_ids = get_other_user_ids

    # Exit early if the ID does not make sense: the ID is already an alternate,
    # the ID is invalid, or the ID is the user ID for this user.
    return if existing_other_user_ids.include? alternate_user_id
    return unless User.find_by_id(alternate_user_id)
    return if alternate_user_id == self.user.id

    other_user_ids = (existing_other_user_ids << alternate_user_id).join(',')
    self.update!(other_user_ids: other_user_ids)
  end

  # The field other_emails is a comma-separated list of alternate email
  # addresses for the user.

  # @returns [Array[String]] an array of email addresses.
  def get_other_emails
    return [] if other_emails.nil?
    other_emails.split(',')
  end

  # @param email [String] an alternate email address for the user.
  def add_other_email(email)
    existing_other_emails = get_other_emails

    # Exit early if the email does not make sense: the email is already an
    # alternate or the email is the email for this user.
    return if existing_other_emails.include? email
    return if Digest::MD5.hexdigest(email) == self.user.hashed_email

    other_emails = (existing_other_emails << email).join(',')
    self.update!(other_emails: other_emails)
  end

  # Returns whether the user has been PDed in course, taking into account a
  # manual answer (which automatically overrides the automatic value) if
  # present.
  # @return [String | nil] the academic year the user was PDed (if PDed) or nil
  #   (if not PDed)
  def get_pd
    return nil if pd_manual == NO_PD
    pd_manual || pd
  end
end
