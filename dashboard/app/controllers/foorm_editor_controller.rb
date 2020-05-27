class FoormEditorController < ApplicationController
  # GET '/foorm/editor/'
  def index
    # only show for admins on non-production
    return render_404 if Rails.env.production? || !current_user.admin?

    formatted_names_and_versions = Foorm::Form.all.map {|form| {name: form.name, version: form.version}}

    @script_data = {
      props: {
        formNamesAndVersions: formatted_names_and_versions
      }.to_json
    }

    render 'foorm/editor/index'
  end
end
