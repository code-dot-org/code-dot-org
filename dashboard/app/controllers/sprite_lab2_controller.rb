# Experimental APIs for the Lab2 Sprite Lab scenes UI variant. Lets a signed-in
# user discover and jump into scenes from projects made by people who share a
# section with them (classmates and their teachers), on the same level.
class SpriteLab2Controller < ApplicationController
  before_action :authenticate_user!

  # GET /sprite_lab2/section_scenes?level_id=N
  # Scene metadata from every section-mate's project on the given level:
  # {scenes: [{channel, sceneId, sceneName, ownerName}]}. Powers the
  # go-to-external-scene block's dropdown.
  def section_scenes
    level = Level.find(params.require(:level_id))
    scenes = []
    section_mates.each do |user|
      channel, sources = project_sources_for(user, level)
      next unless sources
      (sources['scenes'] || []).each do |scene|
        next unless scene['id'] && scene['name']
        scenes << {
          channel: channel,
          sceneId: scene['id'],
          sceneName: scene['name'],
          ownerName: user.name,
        }
      end
    end
    render json: {scenes: scenes}
  end

  # GET /sprite_lab2/external_scenes?channel=X
  # Full scenes + animations of one project, for running an external scene
  # (including its internal scene jumps and its images). Only allowed when the
  # project's owner shares a section with the current user.
  def external_scenes
    channel = params.require(:channel)
    begin
      owner_storage_id, _project_id = get_storage_id_and_project_id(channel)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return head :bad_request
    end
    owner_id = user_id_for_storage_id(owner_storage_id)
    owner = User.find_by(id: owner_id)
    return head :forbidden unless owner && section_mates.include?(owner)

    source_data = SourceBucket.new.get(channel, 'main.json')
    return head :not_found unless source_data[:status] == 'FOUND'
    sources = JSON.parse(source_data[:body].string)
    render json: {
      scenes: sources['scenes'] || [],
      animations: sources['animations'] || {},
      ownerName: owner.name,
    }
  end

  # Everyone who shares a section with the current user (fellow students and
  # the sections' teachers), including the current user themselves.
  private def section_mates
    @section_mates ||= begin
      sections =
        current_user.sections_as_student +
        current_user.sections_instructed +
        current_user.sections_owned
      members = sections.uniq.flat_map do |section|
        section.students.to_a + [section.user].compact
      end
      (members + [current_user]).uniq
    end
  end

  # The user's project channel + parsed sources for a level, or [nil, nil].
  private def project_sources_for(user, level)
    storage_id = storage_id_for_user_id(user.id)
    return [nil, nil] unless storage_id
    channel_token = ChannelToken.find_channel_token(level, storage_id, nil)
    return [nil, nil] unless channel_token
    source_data = SourceBucket.new.get(channel_token.channel, 'main.json')
    return [nil, nil] unless source_data[:status] == 'FOUND'
    [channel_token.channel, JSON.parse(source_data[:body].string)]
  rescue JSON::ParserError
    [nil, nil]
  end
end
