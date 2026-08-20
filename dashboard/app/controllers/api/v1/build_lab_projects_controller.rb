class Api::V1::BuildLabProjectsController < Api::V1::JSONApiController
  # POST /api/v1/build_lab/projects
  def create
    return head :unauthorized unless current_user

    channel = ChannelToken.create_channel(
      request.ip,
      Projects.new(get_storage_id),
      data: {name: 'Untitled Build Lab project'},
      type: 'build-lab'
    )

    render json: {channel: channel}, status: :created
  end
end
