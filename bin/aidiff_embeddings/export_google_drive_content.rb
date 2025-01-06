#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'async'
require 'async/barrier'
require 'fileutils'
require 'net/http'

# Force very small downloads to be stored as Tempfiles instead of using StringIO objects
OpenURI::Buffer.send :remove_const, :StringMax if OpenURI::Buffer.const_defined?(:StringMax)
OpenURI::Buffer.const_set :StringMax, 0

# These methods can/should be moved out of a monkey patch if/when this process
# is moved out of an ad-hoc script
# Regex based on /apps/src/templates/lessonOverview/googleDocsUtils.js.
class Resource
  GDOCS_URL_REGEX = /^https?:\/\/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/

  def google_docs?
    !!(url =~ GDOCS_URL_REGEX)
  end

  def google_pdf_download_url
    return nil unless google_docs?

    url =~ GDOCS_URL_REGEX
    "https://docs.google.com/#{$1}/d/#{$2}/export?format=pdf"
  end
end

BASE_DIR = Dir.home + "/embeddings/"
MAX_ATTEMPTS = 3

# Mapping of download URLs to existing file paths. Many resources are referred
# to from multiple units or lessons. This avoids downloading them multiple times.
# Instead we make a separate copy locally with a distinct metadata file.
$downloaded_files = {}

def download_google_file(url:, path:, metadata:, barrier:)
  barrier.async do
    print '>'

    full_path = BASE_DIR + path
    existing_file = $downloaded_files[url]
    if existing_file.present?
      FileUtils.cp(existing_file, full_path)
    else
      begin
        attempts ||= 1
        handle = URI.parse(url).open
      rescue => exception
        # Some documents do not have public download permissions; skip these.
        if exception&.io&.status.present?
          status_code = exception.io.status[0]
          next if status_code == '401'
        end

        puts "Network error:"
        puts exception.inspect
        if (attempts += 1) <= MAX_ATTEMPTS
          puts "Retrying..."
          retry
        else
          puts "Too many retries, skipping."
          next
        end
      end

      # TODO: Write these files to the S3 bucket instead of / in addition to local filesystem
      FileUtils.cp(handle.path, full_path)
      $downloaded_files[url] = full_path
    end

    full_metadata = {
      metadataAttributes: metadata
    }
    File.write("#{full_path}.metadata.json", full_metadata.to_json)

    print '<'
  end
end

Async do
  # Export resources from courses
  UnitGroup.all.each do |course|
    puts "Course #{course.name}"
    course_metadata = {
      course: course.name
    }

    # Course-level resources: request them all concurrently and wait for the
    # slowest before moving on
    barrier = Async::Barrier.new
    course.resources.filter(&:google_docs?).each_with_index do |resource, i|
      download_google_file(
        url: resource.google_pdf_download_url,
        path: "#{course.name}-#{i}.pdf",
        metadata: course_metadata.merge(
          {
            unit_fullname: 'all',
            unit: 'all',
            lesson: 'all',
            url: resource.url,
            verified_teacher: resource.audience == 'Verified Teacher'
          }
        ),
        barrier: barrier
      )
    end
    barrier.wait
    puts ''

    course.default_units.each do |unit|
      unit_metadata = course_metadata.merge(
        {
          unit_fullname: unit.name,
          unit: format("U%02d", unit.unit_number)
        }
      )
      puts "U#{unit.unit_number}: #{unit.name}"
      prefix = "#{course.name}-U#{unit.unit_number}"

      # Unit-level resources: request them all concurrently and wait for the
      # slowest before moving on
      barrier = Async::Barrier.new
      unit.resources.filter(&:google_docs?).each_with_index do |resource, i|
        download_google_file(
          url: resource.google_pdf_download_url,
          path: "#{prefix}-#{i}.pdf",
          metadata: unit_metadata.merge(
            {
              lesson: 'all',
              url: resource.url,
              verified_teacher: resource.audience == 'Verified Teacher'
            }
          ),
          barrier: barrier
        )
      end
      barrier.wait
      puts ''

      unit.lessons.each do |lesson|
        lesson_metadata = unit_metadata.merge({lesson: format("L%02d", lesson.absolute_position)})
        puts "U#{unit.unit_number}L#{lesson.absolute_position} - #{lesson.name}"
        prefix = "#{course.name}-U#{unit.unit_number}-L#{lesson.absolute_position}"

        # Lesson-level resources: request them all concurrently and wait for the
        # slowest before moving on
        barrier = Async::Barrier.new
        lesson.resources.filter(&:google_docs?).each_with_index do |resource, i|
          download_google_file(
            url: resource.google_pdf_download_url,
            path: "#{prefix}-#{i}.pdf",
            metadata: lesson_metadata.merge(
              {
                url: resource.url,
                verified_teacher: resource.audience == 'Verified Teacher'
              }
            ),
            barrier: barrier
          )
        end
        barrier.wait
        puts ''
      end
    end
  end

  # Export resources from standalone units
  Unit.all.filter(&:is_course?).each do |unit|
    unit_metadata = {
      course: unit.name,
      unit_fullname: unit.name,
      unit: unit.name
    }
    puts "standalone unit: #{unit.name}"
    prefix = "standalone-#{unit.name}"

    # Unit-level resources: request them all concurrently and wait for the
    # slowest before moving on
    barrier = Async::Barrier.new
    unit.resources.filter(&:google_docs?).each_with_index do |resource, i|
      download_google_file(
        url: resource.google_pdf_download_url,
        path: "#{prefix}-#{i}.pdf",
        metadata: unit_metadata.merge(
          {
            lesson: 'all',
            url: resource.url,
            verified_teacher: resource.audience == 'Verified Teacher'
          }
        ),
        barrier: barrier
      )
    end
    barrier.wait
    puts ''

    unit.lessons.each do |lesson|
      lesson_metadata = unit_metadata.merge({lesson: format("L%02d", lesson.absolute_position)})
      puts "L#{lesson.absolute_position} - #{lesson.name}"
      prefix = "standalone-#{unit.name}-L#{lesson.absolute_position}"

      # Lesson-level resources: request them all concurrently and wait for the
      # slowest before moving on
      barrier = Async::Barrier.new
      lesson.resources.filter(&:google_docs?).each_with_index do |resource, i|
        download_google_file(
          url: resource.google_pdf_download_url,
          path: "#{prefix}-#{i}.pdf",
          metadata: lesson_metadata.merge(
            {
              url: resource.url,
              verified_teacher: resource.audience == 'Verified Teacher'
            }
          ),
          barrier: barrier
        )
      end
      barrier.wait
      puts ''
    end
  end
end
