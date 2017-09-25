# This concern validates name for cases where name is used to serialize a model
# to the filesystem
module SerializedToFileValidation
  extend ActiveSupport::Concern

  included do
    validates :name,
      presence: true,
      uniqueness: {case_sensitive: false},
      format: {
        unless: ->(model) {model.try(:skip_name_format_validation)},
        with: /\A[a-z0-9\-]+\z/,
        message: 'can only contain lowercase letters, numbers and dashes'
      }
  end
end
