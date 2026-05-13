# Hackathon AI Lessons Controller
#
# Stores lesson plans as plain JSON on the filesystem under
# `dashboard/tmp/ai_lessons/`.  Deliberately avoids new ActiveRecord models so
# this prototype stays out of the way of the existing Level/Lesson/Script
# infrastructure.
class AiLessonsController < ApplicationController
  before_action :authenticate_user!

  def index
    view_options(full_width: true, no_padding_container: true, no_footer: true)
    @lessons = list_lessons
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
end
