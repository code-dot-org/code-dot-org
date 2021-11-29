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
      script_overview_exists = Services::CurriculumPdfs.script_overview_pdf_exists_for?(script)
      script_resources_exists = Services::CurriculumPdfs.script_resources_pdf_exists_for?(script)
      no_missing_pdfs = pdfless_lessons.empty? && script_overview_exists && script_resources_exists
      next if no_missing_pdfs

      any_missing_pdfs_found = true
      puts "Script #{script.name.inspect} is missing PDFs for:"
      pdfless_lessons.each do |lesson|
        puts "  #{lesson.name.inspect} (#{lesson.key})"
      end
      puts "  Script Overview" unless script_overview_exists
      puts "  Script Resources" unless script_resources_exists
    end

    puts "No missing PDFs found" unless any_missing_pdfs_found
  end

  desc 'Generate any PDFs that we would expect to have been generated automatically but for whatever reason haven\'t been.'
  task generate_missing_pdfs: :environment do
    get_pdf_enabled_scripts.each do |script|
      Dir.mktmpdir("pdf_generation") do |dir|
        any_pdf_generated = false

        get_pdfless_lessons(script).each do |lesson|
          puts "Generating missing PDFs for #{lesson.key} (from #{script.name})"
          Services::CurriculumPdfs.generate_lesson_pdf(lesson, dir)
          Services::CurriculumPdfs.generate_lesson_pdf(lesson, dir, true)
          any_pdf_generated = true
        end

        unless Services::CurriculumPdfs.script_overview_pdf_exists_for?(script)
          puts "Generating missing Script Overview PDF for #{script.name}"
          Services::CurriculumPdfs.generate_script_overview_pdf(script, dir)
          any_pdf_generated = true
        end

        unless Services::CurriculumPdfs.script_resources_pdf_exists_for?(script)
          puts "Generating missing Script Resources PDF for #{script.name}"
          Services::CurriculumPdfs.generate_script_resources_pdf(script, dir)
          any_pdf_generated = true
        end

        if any_pdf_generated
          puts "Generated all missing PDFs for #{script.name}; uploading results to S3"
          Services::CurriculumPdfs.upload_generated_pdfs_to_s3(dir)
        end
      end
    end

    puts "Finished generating missing PDFs"
  end

  task generate_all_pdfs: :environment do
    puts "About to (re)generate all PDFs for all scripts."
    puts "As of Feb 2021, we expect this operation to take about half an hour. We expect it to take longer the more content we've added since that date."
    puts "Are you sure you want to proceed? (y/N)"
    input = STDIN.gets.strip.downcase
    next unless input == 'y'

    get_pdf_enabled_scripts.each do |script|
      Services::CurriculumPdfs.generate_pdfs(script)
    end

    puts "Generated all PDFs"
  end
end
