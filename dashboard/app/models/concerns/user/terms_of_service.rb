module User::TermsOfService
  extend ActiveSupport::Concern

  # When adding a new version, append to the end of the array
  # using the next increasing natural number.
  TERMS_OF_SERVICE_VERSIONS = [
    1  # (July 2016) Teachers can grant access to labs for U13 students.
  ].freeze

  class_methods do
    def latest_terms_version
      TERMS_OF_SERVICE_VERSIONS.last
    end
  end

  # Returns whether the user has accepted the latest major version of the Terms of Service
  def accepted_latest_terms?
    terms_of_service_version == TERMS_OF_SERVICE_VERSIONS.last
  end

  # Updates user's most recently accepted Terms of Service version to the latest version
  def update_user_tos_version_accept
    self.terms_of_service_version = self.class.latest_terms_version
    save!
  end
end
