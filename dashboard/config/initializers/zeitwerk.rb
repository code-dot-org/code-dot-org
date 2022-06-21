# Add overrides for some specific existing acronym edge cases on top of the
# globally-defined acronyms in config/initializers/inflections.rb
#
# Based on https://guides.rubyonrails.org/classic_to_zeitwerk_howto.html#acronyms
Rails.autoloaders.main&.inflector&.inflect(
  "afe_enrollment" => "AFEEnrollment",
  "csta_enrollment" => "CSTAEnrollment",
  "payment_calculator_csf" => "PaymentCalculatorCSF",
  "studio_ec" => "StudioEC"
)
