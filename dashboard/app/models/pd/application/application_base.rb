# == Schema Information
#
# Table name: pd_applications
#
#  id                  :integer          not null, primary key
#  user_id             :integer          not null
#  type                :string(255)      not null
#  application_year    :string(255)      not null
#  application_type    :string(255)      not null
#  regional_partner_id :integer
#  status              :string(255)      not null
#  locked_at           :datetime
#  notes               :text(65535)
#  form_data           :text(65535)      not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  course              :string(255)
#
# Indexes
#
#  index_pd_applications_on_application_type     (application_type)
#  index_pd_applications_on_application_year     (application_year)
#  index_pd_applications_on_course               (course)
#  index_pd_applications_on_regional_partner_id  (regional_partner_id)
#  index_pd_applications_on_status               (status)
#  index_pd_applications_on_type                 (type)
#  index_pd_applications_on_user_id              (user_id)
#

# Base class for the Pd application forms.
# Make sure to use a derived class for a specific application type and year.
# This on its own will fail validation.
module Pd::Application
  class ApplicationBase < ActiveRecord::Base
    include ApplicationConstants
    include Pd::Form

    after_initialize -> {self.status = :unreviewed}, if: :new_record?
    after_initialize :set_type_and_year
    before_validation :set_type_and_year

    def set_type_and_year
      # Override in derived classes and set to valid values.
      # Setting them to nil here fails those validations and prevents this base class from being saved.
      self.application_year = nil
      self.application_type = nil
    end

    self.table_name = 'pd_applications'

    enum status: %w(
      unreviewed
      pending
      accepted
      declined
      waitlisted
    ).index_by(&:to_sym).freeze

    enum course: %w(
      csf
      csd
      csp
    ).index_by(&:to_sym).freeze

    belongs_to :user
    belongs_to :regional_partner

    validates_presence_of :user_id
    validates_inclusion_of :application_type, in: APPLICATION_TYPES
    validates_inclusion_of :application_year, in: APPLICATION_YEARS
    validates_presence_of :type
    validates_presence_of :status

    def locked?
      locked_at.present?
    end

    def lock!
      return if locked?
      update! locked_at: Time.zone.now
    end

    def unlock!
      return unless locked?
      update! locked_at: nil
    end

    def regional_partner_name
      regional_partner.try(:name)
    end
  end
end
