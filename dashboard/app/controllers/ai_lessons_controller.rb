# Hackathon AI Lessons Controller
#
# Stores lesson plans as plain JSON on the filesystem under
# `dashboard/tmp/ai_lessons/`.  Deliberately avoids new ActiveRecord models so
# this prototype stays out of the way of the existing Level/Lesson/Script
# infrastructure.
#
# Repo-shipped exemplar lessons live under `dashboard/config/ai_lessons/`
# and are merged into reads and listings.  They are read-only through the
# API — edit the files directly.  Student state (sources, progress) for a
# builtin lesson still lives under tmp, keyed by the lesson id, so
# reset_progress works on builtins too.
class AiLessonsController < ApplicationController
  before_action :authenticate_user!, except: [:image]

  # All in-app page paths (index / new / edit / show / progress) render
  # the same Single-Page-App shell.  The client-side router in
  # AiLessonsApp inspects window.location and decides which page to
  # show; data is fetched lazily via the JSON endpoints below.
  def app
    view_options(full_width: true, no_padding_container: true, no_footer: true)
  end

  # JSON: list of all saved lessons (used by the index page).
  def lessons_data
    render json: list_lessons
  end

  # JSON: every (lesson, user) progress snapshot we have on disk,
  # enriched with user names + lesson titles for the teacher view.
  def progress_data
    render json: list_all_progress
  end

  # JSON: full LessonPlan for a single lesson (used by the student
  # player and the edit page to hydrate themselves on mount).
  def read
    json = load_lesson_json(params[:id])
    return head :not_found unless json
    render json: json
  end

  def create
    id = generate_id
    write_lesson_json(id, lesson_payload.merge('id' => id))
    render json: {id: id}
  end

  def update
    id = params[:id]
    return render json: {error: 'builtin lessons are read-only; edit the JSON under dashboard/config/ai_lessons'}, status: :unprocessable_entity if builtin_lesson?(id)
    existing = load_lesson_json(id)
    return head :not_found unless existing
    write_lesson_json(id, existing.merge(lesson_payload).merge('id' => id))
    render json: {id: id}
  end

  def destroy
    return render json: {error: 'builtin lessons are read-only; edit the JSON under dashboard/config/ai_lessons'}, status: :unprocessable_entity if builtin_lesson?(params[:id])
    path = lesson_path(params[:id])
    FileUtils.rm_f(path)
    FileUtils.rm_rf(images_dir(params[:id]))
    FileUtils.rm_rf(File.join(storage_dir, 'sources', params[:id]))
    FileUtils.rm_rf(File.join(storage_dir, 'progress', params[:id]))
    FileUtils.rm_rf(File.join(storage_dir, 'inputs', params[:id]))
    render json: {id: params[:id]}
  rescue ArgumentError
    head :bad_request
  end

  # Wipes per-lesson student state — saved sources for every lab type
  # and every user's progress — while leaving the lesson JSON and its
  # generated panel images intact. Intended as a demo affordance so a
  # presenter can return to a fresh playthrough without re-authoring.
  def reset_progress
    id = params[:id]
    return head :not_found unless load_lesson_json(id)
    FileUtils.rm_rf(File.join(storage_dir, 'sources', id))
    FileUtils.rm_rf(File.join(storage_dir, 'progress', id))
    FileUtils.rm_rf(File.join(storage_dir, 'inputs', id))
    render json: {id: id}
  rescue ArgumentError
    head :bad_request
  end

  # Stores an uploaded image under `dashboard/tmp/ai_lessons/images/:id/`
  # and returns the URL the served `image` action will respond to.
  def upload_image
    id = params[:id]
    return head :not_found unless load_lesson_json(id)
    file = params[:file]
    return head :bad_request unless file.respond_to?(:read)

    ext = File.extname(file.original_filename.to_s).downcase
    ext = '.png' unless ext.match?(/\A\.(png|jpg|jpeg|gif|webp)\z/)
    filename = "#{SecureRandom.hex(8)}#{ext}"

    dir = images_dir(id)
    FileUtils.mkdir_p(dir)
    File.binwrite(File.join(dir, filename), file.read)

    render json: {url: "/ai_lessons/#{id}/images/#{filename}"}
  rescue ArgumentError
    head :bad_request
  end

  # Serves an image previously uploaded via `upload_image`.  Auth is not
  # required: the random-hex filename produced by `upload_image` is
  # effectively a capability token, and skipping auth lets <img> tags
  # render the image regardless of which session is in flight.
  def image
    return head :bad_request unless safe_image_filename?(params[:filename])
    path = File.join(images_dir(params[:id]), params[:filename])
    return head :not_found unless File.exist?(path)
    send_file path, disposition: 'inline'
  rescue ArgumentError
    head :bad_request
  end

  # Returns the current user's saved project source for a (lesson, scope)
  # pair, or 404 if no save has happened yet.  A scope is either a lab
  # type ("weblab2", "music") for the lesson-wide project, or a sandbox
  # slug ("sandbox-html-tags") for an isolated skill-practice source.
  # Sources are stored as JSON so the client can pass them straight to
  # the lab2 view as `initialSources`.
  def read_sources
    return head :not_found unless load_lesson_json(params[:id])
    path = sources_path(params[:id], current_user.id, params[:scope])
    return head :not_found unless File.exist?(path)
    render json: JSON.parse(File.read(path))
  rescue ArgumentError, JSON::ParserError
    head :bad_request
  end

  # Stores the current user's project source for a (lesson, scope) pair.
  # The whole JSON request body is treated as the new ProjectSources blob;
  # the client controls the schema.
  def write_sources
    return head :not_found unless load_lesson_json(params[:id])
    raw = request.raw_post
    parsed = JSON.parse(raw)
    path = sources_path(params[:id], current_user.id, params[:scope])
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, JSON.pretty_generate(parsed))
    head :no_content
  rescue ArgumentError, JSON::ParserError
    head :bad_request
  end

  # Returns the current user's progress snapshot for this lesson, or 404
  # if they have never recorded any progress.  Snapshot shape is
  # client-controlled; the controller just persists JSON.
  def read_progress
    return head :not_found unless load_lesson_json(params[:id])
    path = progress_path(params[:id], current_user.id)
    return head :not_found unless File.exist?(path)
    render json: JSON.parse(File.read(path))
  rescue ArgumentError, JSON::ParserError
    head :bad_request
  end

  # Stores a progress snapshot for the current user on this lesson.  Whole
  # JSON request body is treated as the new snapshot.
  def write_progress
    return head :not_found unless load_lesson_json(params[:id])
    raw = request.raw_post
    parsed = JSON.parse(raw)
    path = progress_path(params[:id], current_user.id)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, JSON.pretty_generate(parsed))
    head :no_content
  rescue ArgumentError, JSON::ParserError
    head :bad_request
  end

  # Returns the current user's recorded question answers for this lesson
  # (a map of questionId -> answer record), or an empty object if they
  # haven't answered anything yet.  Shape is client-controlled.
  def read_inputs
    return head :not_found unless load_lesson_json(params[:id])
    path = inputs_path(params[:id], current_user.id)
    return render json: {} unless File.exist?(path)
    render json: JSON.parse(File.read(path))
  rescue ArgumentError, JSON::ParserError
    head :bad_request
  end

  # Stores the current user's question answers for this lesson.  Whole
  # JSON request body replaces the stored map.
  def write_inputs
    return head :not_found unless load_lesson_json(params[:id])
    raw = request.raw_post
    parsed = JSON.parse(raw)
    path = inputs_path(params[:id], current_user.id)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, JSON.pretty_generate(parsed))
    head :no_content
  rescue ArgumentError, JSON::ParserError
    head :bad_request
  end

  private def storage_dir
    @storage_dir ||= begin
      dir = Rails.root.join('tmp', 'ai_lessons')
      FileUtils.mkdir_p(dir)
      dir
    end
  end

  private def lesson_path(id)
    raise ArgumentError, "bad id" unless id.match?(/\A[a-z0-9_-]{1,64}\z/)
    File.join(storage_dir, "#{id}.json")
  end

  private def builtin_dir
    Rails.root.join('config', 'ai_lessons').to_s
  end

  private def builtin_lesson_path(id)
    raise ArgumentError, "bad id" unless id.match?(/\A[a-z0-9_-]{1,64}\z/)
    File.join(builtin_dir, "#{id}.json")
  end

  # A lesson is builtin when it ships in the repo and has no tmp override.
  # (Creating a tmp lesson with a colliding id is possible via the raw API
  # but not the UI; the tmp copy wins so local experiments stay editable.)
  private def builtin_lesson?(id)
    !File.exist?(lesson_path(id)) && File.exist?(builtin_lesson_path(id))
  rescue ArgumentError
    false
  end

  private def load_lesson_json(id)
    path = lesson_path(id)
    path = builtin_lesson_path(id) unless File.exist?(path)
    return nil unless File.exist?(path)
    json = JSON.parse(File.read(path))
    json['builtin'] = true if builtin_lesson?(id)
    json
  rescue ArgumentError, JSON::ParserError
    nil
  end

  private def write_lesson_json(id, data)
    File.write(lesson_path(id), JSON.pretty_generate(data))
  end

  # Walks the on-disk progress directory and returns a flat list of every
  # snapshot we have, enriched with user names + lesson titles for the
  # teacher view.  Skips entries whose lesson JSON has since been deleted.
  private def list_all_progress
    root = File.join(storage_dir, 'progress')
    return [] unless Dir.exist?(root)

    user_cache = {}
    lesson_cache = {}

    Dir.glob(File.join(root, '*', '*.json')).sort.flat_map do |path|
      lesson_id = File.basename(File.dirname(path))
      user_id = File.basename(path, '.json').to_i
      next [] if user_id <= 0

      lesson = lesson_cache[lesson_id] ||= load_lesson_json(lesson_id)
      next [] unless lesson

      parsed = begin
        JSON.parse(File.read(path))
      rescue JSON::ParserError
        next []
      end

      user = user_cache[user_id] ||= User.find_by(id: user_id)
      user_label = user ? (user.name.presence || user.username.presence || "Student ##{user_id}") : "Student ##{user_id}"

      checklist_total = lesson['checklist']&.length || 0

      [{
        'user_id' => user_id,
        'user_label' => user_label,
        'lesson_id' => lesson_id,
        'lesson_title' => lesson['title'] || '(untitled lesson)',
        'lesson_objective' => lesson['objective'],
        'total_checkpoints' => parsed['totalCheckpoints'] || lesson['steps']&.length || lesson['checkpoints']&.length || 0,
        'last_completed_checkpoint_index' => parsed['lastCompletedCheckpointIndex'],
        'last_completed_checkpoint_id' => parsed['lastCompletedCheckpointId'],
        'summary' => parsed['summary'] || '',
        'updated_at' => parsed['updatedAt'] || File.mtime(path).iso8601,
        'checklist_total' => checklist_total,
        'checklist_done' => checklist_total.positive? ? (parsed['checklist'] || {}).count {|_, done| done} : 0,
      }]
    end
  end

  private def list_lessons
    entries = {}
    # Builtins first so a tmp lesson with the same id overrides its entry.
    [[builtin_dir, true], [storage_dir.to_s, false]].each do |dir, builtin|
      Dir.glob(File.join(dir, '*.json')).sort.each do |path|
        parsed = JSON.parse(File.read(path))
        id = parsed['id'] || File.basename(path, '.json')
        entries[id] = {
          'id' => id,
          'objective' => parsed['objective'],
          'title' => parsed['title'],
          'updated_at' => File.mtime(path).iso8601,
          'builtin' => builtin,
        }
      rescue JSON::ParserError
        next
      end
    end
    entries.values
  end

  private def lesson_payload
    # Accept the entire request body as the lesson plan JSON.  We treat the
    # client as authoritative — there's no schema validation here on purpose.
    raw = request.raw_post
    parsed = JSON.parse(raw)
    parsed.is_a?(Hash) ? parsed : {}
  rescue JSON::ParserError
    {}
  end

  private def generate_id
    "#{Time.now.to_i.to_s(36)}-#{SecureRandom.hex(3)}"
  end

  private def images_dir(id)
    raise ArgumentError, "bad id" unless id.is_a?(String) && id.match?(/\A[a-z0-9_-]{1,64}\z/)
    File.join(storage_dir, 'images', id)
  end

  private def safe_image_filename?(filename)
    filename.is_a?(String) && filename.match?(/\A[a-f0-9]{1,64}\.(png|jpg|jpeg|gif|webp)\z/)
  end

  # Per-user since sources became personalized (AI-generated starters);
  # pre-existing per-lesson files at sources/<id>/<scope>.json are simply
  # orphaned.
  private def sources_path(id, user_id, scope)
    raise ArgumentError, "bad id" unless id.is_a?(String) && id.match?(/\A[a-z0-9_-]{1,64}\z/)
    raise ArgumentError, "bad user_id" unless user_id.is_a?(Integer) && user_id.positive?
    raise ArgumentError, "bad scope" unless scope.is_a?(String) && scope.match?(/\A[a-z0-9_-]{1,80}\z/)
    File.join(storage_dir, 'sources', id, user_id.to_s, "#{scope}.json")
  end

  private def progress_path(id, user_id)
    raise ArgumentError, "bad id" unless id.is_a?(String) && id.match?(/\A[a-z0-9_-]{1,64}\z/)
    raise ArgumentError, "bad user_id" unless user_id.is_a?(Integer) && user_id.positive?
    File.join(storage_dir, 'progress', id, "#{user_id}.json")
  end

  private def inputs_path(id, user_id)
    raise ArgumentError, "bad id" unless id.is_a?(String) && id.match?(/\A[a-z0-9_-]{1,64}\z/)
    raise ArgumentError, "bad user_id" unless user_id.is_a?(Integer) && user_id.positive?
    File.join(storage_dir, 'inputs', id, "#{user_id}.json")
  end
end
