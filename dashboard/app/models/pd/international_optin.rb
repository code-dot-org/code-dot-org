# == Schema Information
#
# Table name: pd_international_optins
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  form_data  :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pd_international_optins_on_user_id  (user_id)
#

require 'international_optin_people'

class Pd::InternationalOptin < ApplicationRecord
  include Pd::Form

  def self.required_fields
    [
      :first_name,
      :last_name,
      :email,
      :opt_in
    ]
  end

  def self.options
    super.merge(
      {
        title: %w(Mr. Mrs. Ms. Dr.),
        role: ['Teacher', 'School Administrator', 'District Administrator'],
        gradeLevels: ['High School', 'Middle School', 'Elementary School'],
        program: ['CS Fundamentals (Pre-K - 5th grade)', 'CS Discoveries (6 - 10th grade)', 'CS Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or introductory course)'],
        optIn: ['Yes', 'No'],
        gender: ['Female', 'Male', 'Other', 'Prefer not to answer'],
        ages: ['< 6 years old', '7-8 years old', '9-10 years old', '11-12 years old', '13-14 years old', '15-16 years old', '17-18 years old', '19+ years old'],
        subjects: ['Computer Science', 'ICT', 'Math', 'Science', 'History / Social Studies', 'Language Arts', 'English as a Foreign Language', 'Music', 'Art'],
        resources: ['Bootstrap', 'CodeCademy', 'Google CS First', 'Khan Academy', 'Kodable', 'Lightbot', 'Scratch', 'Tynker'],
        robotics: ['Grok Learning', 'Kodable', 'LEGO Education', 'Microbit', 'Ozobot', 'Sphero', 'Raspberry Pi', 'Wonder Workshop'],
        schoolCountry: %w(Canada Chile Israel Malaysia Mexico Thailand),
        workshopOrganizer: get_international_optin_partners,
        workshopFacilitator: get_international_optin_facilitators,
        workshopCourse: ['CS Fundamentals (Courses A-F)', 'CS Fundamentals (Pre-Express or Express)']
      }
    )
  end

  def email
    sanitize_form_data_hash[:email]
  end

  def opt_in?
    sanitize_form_data_hash[:opt_in].downcase == "yes"
  end
end
