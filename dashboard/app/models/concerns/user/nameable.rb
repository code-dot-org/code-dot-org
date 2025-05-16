module User
  module Nameable
    extend ActiveSupport::Concern

    USERNAME_REGEX = /\A#{UserHelpers::USERNAME_ALLOWED_CHARACTERS.source}+\z/i

    included do
      ## Validation Macros
      validates :name, presence: true, unless: -> {purged_at}
      validates :name, length: {within: 1..70}, allow_blank: true
      validate :no_family_name_for_teachers
      validates_length_of :username, within: 5..20, allow_blank: true
      validates_format_of :username, if: :username_changed?, with: USERNAME_REGEX, allow_blank: true
      validates_uniqueness_of :username, allow_blank: true, case_sensitive: false, on: :create, if: -> {errors.blank?}
      validates_uniqueness_of :username, case_sensitive: false, on: :update, if: -> {errors.blank? && username_changed?}
      validates_presence_of :username, if: :username_required?

      ## Callback Macros
      before_validation :generate_username, on: :create
      before_validation on: [:create, :update], if: -> {name&.utf8mb4?} do
        self.name = name.sanitize_utf8mb4
      end
      before_save :strip_display_family_names
    end

    def short_name
      return username if name.blank?

      name.split.first # 'first name'
    end

    def second_name
      name.split.second # 'second name'
    end

    def initial
      UserHelpers.initial(name)
    end

    def strip_display_family_names
      self.name = name.strip if name && will_save_change_to_name?
      self.family_name = family_name.strip if family_name && will_save_change_to_properties?
    end

    def no_family_name_for_teachers
      if family_name && (teacher? || sections_as_pl_participant.any?)
        errors.add(:family_name, "can't be set for teachers or PL participants")
      end
    end

    def sort_by_family_name?
      !!sort_by_family_name
    end

    def username_required?
      manual? || username_changed?
    end

    def generate_username
      # skip an expensive db query if the name is not valid anyway. we can't depend on validations being run
      return if name.blank? || email&.utf8mb4?
      self.username = UserHelpers.generate_username(User.with_deleted, name)
    end
  end
end
