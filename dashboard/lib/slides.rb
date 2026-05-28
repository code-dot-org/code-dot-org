# A deck of intro slides ("panels-app" panels) attached to some
# curriculum entity — today a Lesson, in the future possibly a Unit, a
# Course, or a Level. Owns the on-disk JSON file and its read/write
# operations so the entity models don't have to.
#
# Decks live under config/slides/<owner_kind>/<path_segments...>/slides.json
# relative to the dashboard root. Mirroring the curriculum hierarchy in
# the directory tree keeps the file system browsable as a stand-in
# index of which entities have decks.
#
# JSON payload shape:
#
#   {
#     "ownerKind": "lesson",
#     "ownerId": <int>,
#     "slides": [
#       {"key": "<uuid>", "description": "<prompt>", "panel": <Panel|null>},
#       ...
#     ]
#   }
#
# `panel` is the panels-app Panel record (text + imageUrl + layout +
# key + optional teacherNote). `description` is the prompt the user
# typed (or that the AI produced) for the slide; it sits alongside the
# panel so the user can tell why a slide was generated and decide
# whether to regenerate. `null` panel means the slide hasn't been
# generated yet.
class Slides
  SLIDES_FILENAME = 'slides.json'.freeze

  # Owners pick path_segments that make the on-disk tree read like the
  # curriculum (e.g. a lesson uses [unit_name, lesson_key]). Segments
  # are sanitized against the path separator since they often come from
  # user-supplied identifiers and legacy data has been seen with
  # unusual characters in keys (e.g. spaces in "Web Design").
  #
  # `base_path` is where `config/slides/...` is anchored — Rails.root in
  # production, an overridable parameter so tests can point a deck at
  # a tmp dir without stubbing Rails.
  def initialize(owner_kind:, owner_id:, path_segments:, base_path: Rails.root)
    @owner_kind = owner_kind.to_sym
    @owner_id = owner_id
    @path_segments = Array(path_segments).map {|s| s.to_s.tr('/', '_')}
    @base_path = base_path
  end

  attr_reader :owner_kind, :owner_id

  def relative_path
    File.join('config', 'slides', @owner_kind.to_s, *@path_segments, SLIDES_FILENAME)
  end

  def file_path
    Pathname.new(@base_path).join(relative_path)
  end

  # Returns the parsed slides.json contents, or an empty skeleton if
  # no file exists yet. Pass `include_teacher_notes: false` to strip
  # every panel's teacherNote field before returning — used by
  # student-facing callers so the notes never reach the student's
  # browser, even via DevTools on the page payload.
  def read(include_teacher_notes: true)
    return empty_envelope unless File.exist?(file_path)
    parsed = JSON.parse(File.read(file_path))
    return parsed if include_teacher_notes
    (parsed['slides'] || []).each do |slide|
      slide['panel']&.delete('teacherNote')
    end
    parsed
  end

  # Overwrites slides.json on disk. Creates the per-owner directory if
  # needed. Always writes the envelope fields so a copied file can be
  # traced back to its origin.
  def write(slides)
    path = file_path
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, JSON.pretty_generate(envelope(slides)))
  end

  private def empty_envelope
    envelope([])
  end

  private def envelope(slides)
    {
      'ownerKind' => @owner_kind.to_s,
      'ownerId' => @owner_id,
      'slides' => slides,
    }
  end
end
