# The Tutor+ class project gallery's listing: for each script level a unit
# tags `class_gallery`, each listed student's saved project behind it.
#
# A tagged script level resolves to the host levels whose channel tokens hold
# students' work: the project template for levels that share one, each
# sublevel for a bubble choice. Opening a level creates its channel before
# anything is saved, so only channels saved since creation are listed.
class ClassGallery
  # @param user_ids [Array<Integer>] the students whose projects to list.
  # @param unit_ids [Array<Integer>] the units whose tagged levels to search.
  def initialize(user_ids:, unit_ids:)
    @user_ids = user_ids
    @unit_ids = unit_ids
  end

  # One entry per student per tagged script level, newest save first.
  # @param viewer [User] decides which reaction chips show as reacted.
  def entries(viewer:, oldest_first: false)
    latest = latest_projects
    return [] if latest.empty?

    users = User.where(id: latest.keys.map(&:first).uniq).index_by(&:id)
    reactions = ProjectReaction.where(project_id: latest.values.map {|p, _| p.id}).group_by(&:project_id)
    rows = latest.map do |(user_id, _), (project, script_level)|
      entry(project, script_level, users[user_id], reactions[project.id] || [], viewer)
    end
    rows.sort_by! {|row| row[:updated_at]}
    oldest_first ? rows : rows.reverse
  end

  # {unit_id => entry count} over the same projects as entries.
  def unit_counts
    latest_projects.values.map {|_, script_level| script_level.script_id}.tally
  end

  # {[user_id, script_level_id] => [project, script_level]}, keeping the most
  # recently saved project where a student has several (bubble choices).
  private def latest_projects
    @latest_projects ||= begin
      script_level_for = {}
      tagged_script_levels.each do |script_level|
        host_level_ids(script_level).each do |level_id|
          script_level_for[[script_level.script_id, level_id]] ||= script_level
        end
      end
      user_id_by_storage_id = script_level_for.empty? ? {} : ProjectStorage.where(user_id: @user_ids).pluck(:id, :user_id).to_h

      latest = {}
      unless user_id_by_storage_id.empty?
        tokens = ChannelToken.where(
          script_id: script_level_for.keys.map(&:first).uniq,
          level_id: script_level_for.keys.map(&:last).uniq,
          storage_id: user_id_by_storage_id.keys
        ).to_a
        projects = Project.where(id: tokens.map(&:storage_app_id), state: 'active').
          where('updated_at > created_at').
          index_by(&:id)
        tokens.each do |token|
          project = projects[token.storage_app_id]
          script_level = script_level_for[[token.script_id, token.level_id]]
          next unless project && script_level
          key = [user_id_by_storage_id[token.storage_id], script_level.id]
          latest[key] = [project, script_level] if latest[key].nil? || project.updated_at > latest[key].first.updated_at
        end
      end
      latest
    end
  end

  private def tagged_script_levels
    @unit_ids.
      filter_map {|unit_id| Unit.get_from_cache(unit_id, raise_exceptions: false)}.
      flat_map(&:script_levels).
      select(&:class_gallery)
  end

  private def host_level_ids(script_level)
    script_level.levels.
      flat_map {|level| level.is_a?(BubbleChoice) ? level.sublevels : [level]}.
      select(&:channel_backed?).
      map {|level| level.host_level.id}.
      uniq
  end

  private def entry(project, script_level, user, reactions, viewer)
    value = project.value ? JSON.parse(project.value) : {}
    channel = channel_id(project)
    lesson = script_level.lesson
    {
      channel: channel,
      project_type: project.project_type,
      name: value['name'],
      thumbnail_url: value['thumbnailUrl'],
      share_path: share_path(project.project_type, channel),
      updated_at: project.updated_at,
      user_id: user&.id,
      user_name: user&.name,
      unit_id: script_level.script_id,
      lesson_position: lesson&.relative_position,
      lesson_name: lesson&.localized_name,
      script_level_id: script_level.id,
      level_position: script_level.position,
      reactions: EmojiReactions.summarize(reactions, viewer),
    }
  end

  # get_project_channel_id, without its re-read of the projects row.
  private def channel_id(project)
    return project.uuid if DCDO.get('project-uuid-in-url', false) && project.uuid
    storage_encrypt_channel_id(project.storage_id, project.id)
  end

  private def share_path(project_type, channel)
    return nil unless project_type && ProjectsController::STANDALONE_PROJECTS.key?(project_type.to_sym)
    "/projects/#{project_type}/#{channel}"
  end
end
