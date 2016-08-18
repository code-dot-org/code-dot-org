# Public Key Cryptography Widget-specific cucumber step definitions

# Which stage of allthethings.script contains the PKC levels; this way we
# only have to update in one place if this changes.
PUBLIC_KEY_CRYPTOGRAPHY_ALLTHETHINGS_STAGE = 32

Given /^I am on the (\d+)(?:st|nd|rd|th)? Public Key Cryptography test level$/ do |level_index|
  steps <<-STEPS
    And I am on "http://learn.code.org/s/allthethings/stage/#{PUBLIC_KEY_CRYPTOGRAPHY_ALLTHETHINGS_STAGE}/puzzle/#{level_index}"
    And I rotate to landscape
  STEPS
end
