class FoormEditorController < ApplicationController
  # GET '/foorm/editor/'
  def index
    # only show for admins on non-production for now
    return render_404 if Rails.env.production? || !current_user.admin?

    form_names = Foorm::Form.pluck(:name, :version)
    formatted_names_and_versions = []
    form_names.each do |form_data|
      formatted_names_and_versions << {name: form_data[0], version: form_data[1]}
    end

    @script_data = {
      props: {
        formNamesAndVersions: formatted_names_and_versions
      }.to_json
    }

    render 'foorm/editor/index'
  end
end
