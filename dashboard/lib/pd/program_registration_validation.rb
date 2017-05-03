require lib_dir 'forms/pegasus_form_validation'
require pegasus_dir 'forms/pd_program_registration'

class Pd::ProgramRegistrationValidation
  extend PegasusFormValidation

  def self.validate(form_data)
    validate_form('PdProgramRegistration', form_data)
  end
end
