require pegasus_dir 'src/forms'

FORM_CLASS = PdProgramRegistration

class Pd::ProgramRegistrationValidation
  # Extend PegasusFormValidation into this class to expose validate_form,
  # And extend it into the form class (PdProgramRegistration) so the Pegasus "globals" (required, etc.)
  # are accessible during validation.
  extend PegasusFormValidation
  FORM_CLASS.extend PegasusFormValidation

  def self.validate(form_data)
    validate_form(FORM_CLASS.name, form_data)
  end
end
