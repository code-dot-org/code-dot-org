namespace :curriculum_pdfs do
  def get_pdf_enabled_scripts
    Script.all.select do |script|
      script.is_migrated && script.seeded_from.present?
    end
  end

  def get_pdfless_lessons(script)
    script.lessons.select(&:has_lesson_plan).select do |lesson|
      !Services::CurriculumPdfs.lesson_plan_pdf_exists_for?(lesson) ||
        !Services::CurriculumPdfs.lesson_plan_pdf_exists_for?(lesson, true)
    end
  end

  desc 'Identify all content for which we expect to have a generated PDF, but don\'t.'
  task identify_missing_pdfs: :environment do
    any_missing_pdfs_found = false
    get_pdf_enabled_scripts.each do |script|
      pdfless_lessons = get_pdfless_lessons(script)
      next if pdfless_lessons.empty?

      any_missing_pdfs_found = true
      puts "Script #{script.name.inspect} is missing PDFs for:"
      pdfless_lessons.each do |lesson|
        puts "  #{lesson.name.inspect} (#{lesson.key})"
      end
    end

    puts "No missing PDFs found" unless any_missing_pdfs_found
  end

  desc 'Generate any PDFs that we would expect to have been generated automatically but for whatever reason haven\'t been.'
  task generate_missing_pdfs: :environment do
    Dir.mktmpdir("pdf_generation") do |dir|
      any_pdf_generated = false
      get_pdf_enabled_scripts.each do |script|
        get_pdfless_lessons(script).each do |lesson|
          puts "Generating missing PDF for #{lesson.key} (from #{script.name})"
          Services::CurriculumPdfs.generate_lesson_pdf(lesson, dir)
          Services::CurriculumPdfs.generate_lesson_pdf(lesson, dir, true)
          any_pdf_generated = true
        end
      end

      if any_pdf_generated
        puts "Generated all missing PDFs, uploading results to S3"
        Services::CurriculumPdfs.upload_generated_pdfs_to_s3(dir)
      else
        puts "No missing PDFs found to generate"
      end
    end
  end

  task generate_all_pdfs: :environment do
    puts "About to (re)generate all PDFs for all scripts."
    puts "As of Feb 2021, we expect this operation to take about half an hour. We expect it to take longer the more content we've added since that date."
    puts "Are you sure you want to proceed? (y/N)"
    input = STDIN.gets.strip.downcase
    next unless input == 'y'

    Dir.mktmpdir("pdf_generation") do |dir|
      get_pdf_enabled_scripts.each do |script|
        script.lessons.select(&:has_lesson_plan).each do |lesson|
          Services::CurriculumPdfs.generate_lesson_pdf(lesson, dir)
          Services::CurriculumPdfs.generate_lesson_pdf(lesson, dir, true)
        end
      end
      Services::CurriculumPdfs.upload_generated_pdfs_to_s3(dir)
    end

    puts "Generated all PDFs"
  end
end
