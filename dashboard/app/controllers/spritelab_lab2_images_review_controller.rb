# Internal playtest-review page (project validators only): the most recently
# used Sprite Lab in Lab2 projects, each with every AI-generated image and
# the prompt that made it.
# The assets bucket is versioned, so images no longer in the project — the
# editor's cleanup soft-deletes superseded generations, and deleting an
# animation orphans its asset outright — are still listable and shown as
# discarded.
class SpritelabLab2ImagesReviewController < ApplicationController
  before_action :authenticate_user!
  before_action :require_project_validator

  # How many recent projects the page shows.
  PROJECT_COUNT = 20

  # Opening a level mints an empty channel, so the walk skips channels that
  # never saved sources; give up after this many candidates.
  CANDIDATE_LIMIT = 200

  # Old manifests fetched per project to recover discarded images' prompts,
  # sampled evenly across the history — autosaves cluster, so a stride finds
  # far more animations per fetch than newest-first.
  MANIFEST_VERSIONS_SCANNED = 60

  def index
    @project_count = PROJECT_COUNT
    @reports = []
    candidate_projects.each do |project, level_names|
      break if @reports.size >= PROJECT_COUNT
      report = build_report(project, level_names)
      @reports << report if report
    end
  end

  # The permission for staff vetted to review student-made content (featured
  # projects, flagged-content review); levelbuilder doesn't imply that.
  private def require_project_validator
    head :forbidden unless current_user.permission?(UserPermission::PROJECT_VALIDATOR)
  end

  # The last CANDIDATE_LIMIT distinct projects attached to any Lab2 Sprite
  # Lab level, most recently saved first, with the level names seen for each.
  # A project shared across levels via a template appears once.
  private def candidate_projects
    # LIKE is only a prefilter: a level whose Lab2 box was later unchecked
    # stores "false" and must not surface its projects here.
    level_names_by_id = Level.where(type: 'GamelabJr').
      where("properties LIKE '%uses_lab2%'").
      pluck(:id, :name, :properties).
      filter_map {|id, name, props| [id, name] if props['uses_lab2'].to_s == 'true'}.
      to_h
    tokens = ChannelToken.where(level_id: level_names_by_id.keys)
    recent_ids = tokens.group(:storage_app_id).
      order(Arel.sql('MAX(channel_tokens.updated_at) DESC')).
      limit(CANDIDATE_LIMIT).
      pluck(:storage_app_id)
    level_names = tokens.where(storage_app_id: recent_ids).
      pluck(:storage_app_id, :level_id).
      group_by(&:first).
      transform_values {|rows| rows.map {|_, level_id| level_names_by_id[level_id]}.uniq.sort}
    projects = Project.where(id: recent_ids).index_by(&:id)
    recent_ids.filter_map {|id| projects[id] && [projects[id], level_names[id] || []]}.
      sort_by {|project, _| project.updated_at || Time.at(0)}.
      reverse
  end

  # Returns the report hash for one project, or nil for a channel that never
  # saved sources.
  private def build_report(project, level_names)
    channel = project.channel_id
    bucket = SourceBucket.new
    current = bucket.get(channel, 'main.json')
    return nil if current[:status] != 'FOUND'
    current_manifest = current[:body].string
    files = SpritelabLab2GeneratedAssets.new.generated_files(channel)
    referenced = animation_entries(current_manifest).keys.to_set
    generations = generations_by_filename(
      bucket, channel, current_manifest, files.pluck(:filename)
    )
    {
      channel: channel,
      level_names: level_names,
      updated_at: project.updated_at,
      images: files.map do |file|
        file.merge(
          discarded: referenced.exclude?(file[:filename]),
          generation: generations[file[:filename]]
        )
      end,
    }
  end

  # Parses a manifest into {asset filename => animation props}.
  private def animation_entries(manifest_json)
    manifest = begin
      JSON.parse(manifest_json)
    rescue JSON::ParserError
      nil
    end
    (manifest&.dig('animations', 'propsByKey') || {}).values.
      # A sourceUrl can also be a library reference or a whole data URI,
      # neither of which names an uploaded file in this channel.
      select {|props| props['sourceUrl'].to_s.start_with?('/v3/assets/')}.
      index_by {|props| props['sourceUrl'][%r{/([^/?]+)(?:\?|\z)}, 1]}
  end

  # Maps asset filenames to the generation metadata recorded on the animation
  # that referenced them, searching the current manifest first and then recent
  # manifest versions for filenames only a discarded animation ever named.
  private def generations_by_filename(bucket, channel, current_manifest, filenames)
    remaining = filenames.to_set
    found = {}
    scan = lambda do |manifest_json|
      animation_entries(manifest_json).each do |filename, props|
        next unless remaining.include?(filename)
        found[filename] = {
          name: props['name'],
          prompt: props.dig('generation', 'prompt'),
          image_type: props.dig('generation', 'imageType'),
          style: props.dig('generation', 'style'),
        }
        remaining.delete(filename)
      end
    end

    scan.call(current_manifest)
    if remaining.any?
      versions = bucket.list_versions(channel, 'main.json').
        reject {|version| version[:isLatest]}
      stride = [versions.size.fdiv(MANIFEST_VERSIONS_SCANNED).ceil, 1].max
      versions.each_slice(stride).map(&:first).each do |version|
        break if remaining.empty?
        old = bucket.get(channel, 'main.json', nil, version[:versionId])
        scan.call(old[:body].string) if old[:status] == 'FOUND'
      end
    end
    found
  end
end
