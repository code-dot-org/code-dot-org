# Provides name-related validations, sanitization, and helper methods for User models.
# Ensures presence and length constraints on `name`, strips unwanted characters,
# and adds utility methods like `short_name`, `initial`, and sorting flags.
module User::Nameable
  extend ActiveSupport::Concern

  included do
    ## Validation Macros
    validates :name, presence: true, unless: -> {purged_at || pii_scrubbed_at}
    validates :name, length: {within: 1..70}, allow_blank: true

    ## Callback Macros
    before_validation on: [:create, :update], if: -> {name&.utf8mb4?} do
      self.name = name.sanitize_utf8mb4
    end
    before_save :strip_display_given_family_names
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

  def strip_display_given_family_names
    self.name = name.strip if name && will_save_change_to_name?
    self.given_name = given_name.strip if given_name && will_save_change_to_properties?
    self.family_name = family_name.strip if family_name && will_save_change_to_properties?
  end

  def full_name
    return "#{given_name} #{family_name}" if given_name && family_name
    name || username || ""
  end

  def sort_by_family_name?
    !!sort_by_family_name
  end
end
