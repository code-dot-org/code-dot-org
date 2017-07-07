class Api::V1::Pd::FacilitatorProgramRegistrationsController < Api::V1::Pd::FormsController
  authorize_resource class: 'Pd::FacilitatorProgramRegistration', only: :create

  def new_form
    teachercon = params.try(:[], :teachercon)

    ::Pd::FacilitatorProgramRegistration.new(
      user: current_user,
      teachercon: teachercon,
    )
  end
end
