# Hackathon AI Lessons Controller
#
# Stores lesson plans as plain JSON on the filesystem under
# `dashboard/tmp/ai_lessons/`.  Deliberately avoids new ActiveRecord models so
# this prototype stays out of the way of the existing Level/Lesson/Script
# infrastructure.
class AiLessonsController < ApplicationController
  before_action :authenticate_user!, except: [:image]

  def index
    view_options(full_width: true, no_padding_container: true, no_footer: true)
    @lessons = list_lessons
  end

  # Teacher-facing roll-up: every (lesson, user) pair we have a progress
  # snapshot for, with the user's name, the lesson's title, the last
  # completed checkpoint index, and the latest LLM-generated summary.
  # Currently shows everyone — no section/class filtering yet.
  def all_progress
    view_options(full_width: true, no_padding_container: true, no_footer: true)
    @progress_entries = list_all_progress
  end

  def new
    view_options(full_width: true, no_padding_container: true, no_footer: true)
  end

  def edit
    view_options(full_width: true, no_padding_container: true, no_footer: true)
    @lesson_id = params[:id]
    @initial_lesson = load_lesson_json(@lesson_id)
    return head :not_found unless @initial_lesson
  end

  def show
    view_options(full_width: true, no_padding_container: true, no_footer: true)
    @lesson_id = params[:id]
    @lesson_json = load_lesson_json(@lesson_id)
    return head :not_found unless @lesson_json
  end

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
    existing = load_lesson_json(id)
    return head :not_found unless existing
    write_lesson_json(id, existing.merge(lesson_payload).merge('id' => id))
    render json: {id: id}
  end

  def destroy
    path = lesson_path(params[:id])
    FileUtils.rm_f(path)
    FileUtils.rm_rf(images_dir(params[:id]))
    FileUtils.rm_rf(File.join(storage_dir, 'sources', params[:id]))
    FileUtils.rm_rf(File.join(storage_dir, 'progress', params[:id]))
    render json: {id: params[:id]}
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

  # Returns the saved project source for a (lesson, lab_type) pair, or 404
  # if no save has happened yet.  Sources are stored as JSON so the client
  # can pass them straight to the lab2 view as `initialSources`.
  def read_sources
    return head :not_found unless load_lesson_json(params[:id])
    path = sources_path(params[:id], params[:lab_type])
    return head :not_found unless File.exist?(path)
    render json: JSON.parse(File.read(path))
  rescue ArgumentError, JSON::ParserError
    head :bad_request
  end

  # Stores the current project source for a (lesson, lab_type) pair.  The
  # whole JSON request body is treated as the new ProjectSources blob; the
  # client controls the schema.
  def write_sources
    return head :not_found unless load_lesson_json(params[:id])
    raw = request.raw_post
    parsed = JSON.parse(raw)
    path = sources_path(params[:id], params[:lab_type])
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

  private def load_lesson_json(id)
    path = lesson_path(id)
    return nil unless File.exist?(path)
    JSON.parse(File.read(path))
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

      [{
        'user_id' => user_id,
        'user_label' => user_label,
        'lesson_id' => lesson_id,
        'lesson_title' => lesson['title'] || '(untitled lesson)',
        'lesson_objective' => lesson['objective'],
        'total_checkpoints' => parsed['totalCheckpoints'] || lesson['checkpoints']&.length || 0,
        'last_completed_checkpoint_index' => parsed['lastCompletedCheckpointIndex'],
        'last_completed_checkpoint_id' => parsed['lastCompletedCheckpointId'],
        'summary' => parsed['summary'] || '',
        'updated_at' => parsed['updatedAt'] || File.mtime(path).iso8601,
      }]
    end
  end

  private def list_lessons
    Dir.glob(File.join(storage_dir, '*.json')).sort.map do |path|
      parsed = JSON.parse(File.read(path))
      {
        'id' => parsed['id'] || File.basename(path, '.json'),
        'objective' => parsed['objective'],
        'title' => parsed['title'],
        'updated_at' => File.mtime(path).iso8601,
      }
    rescue JSON::ParserError
      nil
    end.compact
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

  private def sources_path(id, lab_type)
    raise ArgumentError, "bad id" unless id.is_a?(String) && id.match?(/\A[a-z0-9_-]{1,64}\z/)
    raise ArgumentError, "bad lab_type" unless lab_type.is_a?(String) && lab_type.match?(/\A[a-z0-9_]{1,32}\z/)
    File.join(storage_dir, 'sources', id, "#{lab_type}.json")
  end

  private def progress_path(id, user_id)
    raise ArgumentError, "bad id" unless id.is_a?(String) && id.match?(/\A[a-z0-9_-]{1,64}\z/)
    raise ArgumentError, "bad user_id" unless user_id.is_a?(Integer) && user_id.positive?
    File.join(storage_dir, 'progress', id, "#{user_id}.json")
  end
end
