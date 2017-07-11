class Api::V1::Pd::RegionalPartnerProgramRegistrationsController < Api::V1::Pd::FormsController
  authorize_resource class: 'Pd::RegionalPartnerProgramRegistration', only: :create

  def new_form
    teachercon = params.require(:teachercon)

    ::Pd::RegionalPartnerProgramRegistration.create(
      user: current_user,
      teachercon: teachercon,
    )
  end
end
