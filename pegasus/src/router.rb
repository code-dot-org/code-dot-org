require_relative 'pegasus/base'
require src_dir 'course'

class Router < Pegasus::Base

  get '/curriculum/:kind' do |kind|
    # Temporarily prevent non K-5/MSM curriculum from appearing on production.
    unless Course::PRODUCTION_COURSES.include? kind
      pass if rack_env == :production
    end

    pass unless request.site == 'code.org'

    document = resolve_document(sites_dir('virtual'), "/curriculum-#{kind}")
    pass if document.nil?
    render(document, partials_dir: File.join(sites_dir('virtual'), "/curriculum-#{kind}"))
  end

  get '/curriculum/docs/*' do |file|
    pass unless request.site == 'code.org'

    document = resolve_document(sites_dir('virtual'), File.join('curriculum-docs', file))
    pass if document.nil?
    render(document, partials_dir: File.join(sites_dir('virtual'), "/curriculum-docs/#{file}"))
  end

  get '/curriculum/docs/*' do |filename|
    # Static files in /curriculum/docs
    path = sites_dir('virtual', 'curriculum-docs', filename)
    pass if settings.template_extnames.include?(File.extname(path))
    pass unless File.file?(path)

    cache_control :public, :must_revalidate, :max_age=>settings.document_max_age
    return send_file(path)
  end

  get '/curriculum/:kind/docs/*' do |kind, file|
    # Temporarily prevent non K-5/MSM curriculum from appearing on production.
    unless Course::PRODUCTION_COURSES.include? kind
      pass if rack_env == :production
    end

    pass unless request.site == 'code.org'

    document = resolve_document(sites_dir('virtual'), "/curriculum-#{kind}/docs/#{file}")
    pass if document.nil?
    render(document, partials_dir: File.join(sites_dir('virtual'), "/curriculum-#{kind}/docs/#{file}"))
  end

  get '/curriculum/:kind/*' do |kind, parts|
    # Temporarily prevent non K-5/MSM curriculum from appearing on production.
    unless Course::PRODUCTION_COURSES.include? kind
      pass if rack_env == :production
    end

    pass unless request.site == 'code.org'

    unit_lesson, filename = parts.split('/')

    dir = sites_dir("virtual/curriculum-#{kind}")

    if filename.nil?
      lesson_dir = dir
    else
      lesson_dir = File.join(dir, unit_lesson)
    end

    document = resolve_document(lesson_dir, filename||'lesson')
    return render(document, unit_lesson: unit_lesson, partials_dir: lesson_dir) unless document.nil?

    if File.file?(static_path = File.join(dir, parts))
      pass if settings.template_extnames.include?(File.extname(static_path))
      cache_control :public, :must_revalidate, :max_age=>settings.document_max_age
      return send_file(static_path)
    end

    pass
  end

  # Forms
  [
    DistrictPartnerInfo,
  ].each do |kind|
    post "/#{kind.storage_names[:default]}" do
      submit_form(kind, request, params)
    end
    post "/#{kind.storage_names[:default]}/:edit_token" do |edit_token|
      row = kind.first(:edit_token=>edit_token)
      pass if row.nil?
      submit_form(row, request, params)
    end
  end

end
