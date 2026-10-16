# == Schema Information
#
# Table name: teacher_directory_verification_requests
#
#  id                 :bigint           not null, primary key
#  user_id            :bigint           not null
#  school_id          :string(12)       not null
#  school_name        :string(255)      not null
#  email              :string(255)      not null
#  status             :string(255)      default("pending_confirmation"), not null
#  evidence_url       :string(2048)     not null
#  evidence_title     :string(255)
#  evidence_email     :string(255)      not null
#  token_digest       :string(64)
#  token_expires_at   :datetime
#  confirmed_at       :datetime
#  ticket_external_id :string(36)       not null
#  zendesk_ticket_id  :string(255)
#  purge_after        :datetime         not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  idx_teacher_dir_verif_purge   (purge_after)
#  idx_teacher_dir_verif_ticket  (ticket_external_id) UNIQUE
#  idx_teacher_dir_verif_token   (token_digest) UNIQUE
#  idx_teacher_dir_verif_user    (user_id) UNIQUE
#
require 'digest'

class TeacherDirectoryVerificationRequest < ApplicationRecord
  STATUSES = %w(
    pending_confirmation
    submitted
    zendesk_created
  ).freeze

  RETENTION_PERIOD = 90.days

  data_classification(
    id: :restricted,
    user_id: :restricted,
    school_id: :restricted,
    school_name: :restricted,
    email: :restricted,
    status: :restricted,
    evidence_url: :restricted,
    evidence_title: :restricted,
    evidence_email: :restricted,
    token_digest: :restricted,
    token_expires_at: :restricted,
    confirmed_at: :restricted,
    ticket_external_id: :restricted,
    zendesk_ticket_id: :restricted,
    purge_after: :restricted,
    created_at: :restricted,
    updated_at: :restricted,
  )

  belongs_to :user

  validates :status, inclusion: {in: STATUSES}
  validates :school_id, :school_name, :email, :evidence_url, :evidence_email,
    :ticket_external_id, :purge_after, presence: true
  validates :token_digest, :token_expires_at, presence: true, if: :token_pending_confirmation?

  def self.digest_token(token)
    Digest::SHA256.hexdigest(token)
  end

  def self.find_by_token(token)
    return if token.blank? || token.length > 128

    find_by(token_digest: digest_token(token))
  end

  def valid_for_user?(candidate)
    return false unless candidate&.id == user_id
    return false unless %w(pending_confirmation submitted).include?(status)
    return false unless token_digest.present? && token_expires_at&.future?
    return false if status == 'submitted' && confirmed_at.blank?

    eligible_teacher?(candidate)
  end

  def eligible_for_ticket?(candidate)
    status == 'submitted' && confirmed_at.present? && eligible_teacher?(candidate)
  end

  def consume_token!
    update_columns(token_digest: nil, token_expires_at: nil, updated_at: Time.current)
  end

  def token_pending_confirmation?
    status == 'pending_confirmation'
  end

  def eligible_teacher?(candidate)
    return false unless candidate&.id == user_id
    return false unless candidate.teacher? && !candidate.verified_teacher?
    return false unless candidate.email.present? && candidate.email.casecmp?(email)

    current_school = candidate.school_info&.school
    current_school&.id.to_s == school_id
  end

  # Repeated POSTs are safe and let a teacher retry if job enqueueing failed.
  def confirm!(candidate)
    return false unless valid_for_user?(candidate)
    return true if status == 'submitted'

    self.class.where(
      id: id,
      status: 'pending_confirmation',
      token_digest: token_digest,
      token_expires_at: Time.current..
    ).update_all(status: 'submitted', confirmed_at: Time.current, updated_at: Time.current) == 1
  end
end
