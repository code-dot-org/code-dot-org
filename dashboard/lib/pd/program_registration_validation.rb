require File.join(CDO.root_dir, 'lib/forms/pegasus_form_validation')
require File.join(CDO.root_dir, 'pegasus/forms/pd_program_registration')

class Pd::ProgramRegistrationValidation
  extend PegasusFormValidation

  def self.validate(form_data)
    validate_form('PdProgramRegistration', form_data)
  end
end
