require 'active_support/concern'
require 'cdo/chat_client'
require 'cdo/google/drive'
require 'open-uri'
require 'pdf/collate'
require 'pdf/conversion'
require 'uri'
require 'google/apis/drive_v3'
require 'google/api_client/client_secrets'
require 'googleauth'

module Services
  module CurriculumPdfs
    # Contains all code related to generating rollup PDFs containing all
    # resources within a given script.
    module Resources
      extend ActiveSupport::Concern

      Drive = Google::Apis::DriveV3

      class_methods do
        # Build the full path of the resource PDF for the given script. This
        # will be based not only on the name of the script but also the current
        # version of the script in the environment.
        #
        # For example: <Pathname:csp1-2021/20210909014219/Digital+Information+('21-'22)+-+Resources.pdf>
        def get_script_resources_pathname(script, versioned: true)
          filename = ActiveStorage::Filename.new(script.localized_title.parameterize(preserve_case: true) + "-Resources.pdf").to_s
          script_overview_pathname = get_script_overview_pathname(script, versioned: versioned)
          return nil unless script_overview_pathname
          subdirectory = File.dirname(script_overview_pathname)
          return Pathname.new(File.join(subdirectory, filename))
        end

        # Build the full user-facing url where a Resource Rollup PDF can be
        # found for the given script.
        #
        # For example: https://lesson-plans.code.org/csp1-2021/20210909014219/Digital+Information+%28%2721-%2722%29+-+Resources.pdf
        def get_unit_resources_url(script)
          return nil unless Services::CurriculumPdfs.should_generate_resource_pdf?(script)
          versioned = script_resources_pdf_exists_for?(script)
          pathname = get_script_resources_pathname(script, versioned: versioned)
          return nil if pathname.blank?
          File.join(get_base_url, pathname)
        end

        # Generate a PDF containing a rollup of all Resources in the given
        # Unit, grouped by Lesson
        def generate_script_resources_pdf(script, directory = "/tmp/")
          ChatClient.log("Generating script resources PDF for #{script.name.inspect}")
          pdfs_dir = Dir.mktmpdir(__method__.to_s)
          pdfs = []

          # Gather together PDFs of all resources in all lessons, grouped by
          # lesson with a title page.
          script.lessons.each do |lesson|
            ChatClient.log("Gathering resources for #{lesson.key.inspect}") if DEBUG
            lesson_pdfs = lesson.resources.filter_map do |resource|
              fetch_resource_pdf(resource, pdfs_dir) if resource.should_include_in_pdf?
            end

            next if lesson_pdfs.empty?

            pdfs.push(generate_lesson_resources_title_page(lesson, pdfs_dir))
            pdfs.push(*lesson_pdfs)
          end

          # Merge all gathered PDFs
          destination = File.join(directory, get_script_resources_pathname(script))
          fallback_destination = File.join(directory, get_script_resources_pathname(script, versioned: false))
          FileUtils.mkdir_p(File.dirname(destination))

          # We've been having an intermittent issue where this step will fail
          # with a ghostscript error. The only way I've been able to reproduce
          # this error locally is by deleting one of the PDFs out from under
          # the generation process prior to the merge attempt, and I'm a bit
          # skeptical that that explains what's going on in the actual staging
          # environment.
          #
          # So, in an effort to better understand what's actually happening,
          # I'm adding some explicit logging.
          begin
            PDF.merge_local_pdfs(destination, *pdfs)
          rescue Exception => exception
            ChatClient.log(
              "Error when trying to merge resource PDFs for #{script.name}: #{exception}",
              color: 'red'
            )
            ChatClient.log(
              "destination: #{destination.inspect}",
              color: 'red'
            )
            ChatClient.log(
              "pdfs: #{pdfs.inspect}",
              color: 'red'
            )
            ChatClient.log(
              "temporary directory contents: #{Dir.entries(pdfs_dir).inspect}",
              color: 'red'
            )
            # !subteam^S07FB3XSAR5 - would notify the teacher-tools-on-call group
            ChatClient.log(
              "<!subteam^S07FB3XSAR5> Please follow instructions in https://docs.google.com/document/d/1mBY56DeAzrwTM3CVIOFho3azTi9mudE37ZQrVZXxaMA/edit#heading=h.axfu5or8cueg to troubleshoot",
              color: 'red'
            )
            raise exception
          end
          FileUtils.remove_entry_secure(pdfs_dir)

          FileUtils.mkdir_p(File.dirname(fallback_destination))
          FileUtils.cp(destination, fallback_destination)

          return destination
        end

        # Check s3 to see if we've already generated a resource rollup PDF for
        # the given script
        def script_resources_pdf_exists_for?(script)
          pathname = get_script_resources_pathname(script).to_s
          return pdf_exists_at?(pathname)
        end

        # Generates a title page for the given lesson; this is used in the
        # final PDF rollup to group the resources by the lesson in which they
        # appear.
        def generate_lesson_resources_title_page(lesson, directory = "/tmp/")
          @lesson_resources_title_page_template ||= File.read(
            File.join(File.dirname(__FILE__), 'lesson_resources_title_page.html.haml')
          )

          page_content = ApplicationController.render(
            inline: @lesson_resources_title_page_template,
            locals: {lesson: lesson},
            type: :haml
          )

          filename = ActiveStorage::Filename.new("lesson.#{lesson.key.parameterize}.title.pdf").to_s
          path = File.join(directory, filename)

          PDF.generate_from_html(page_content, path)

          # we've been having some issues with these title page PDFs not
          # existing on the filesystem when it comes time to make the rollup.
          #
          # It's not yet clear whether that's because this step is failing to
          # generate or because the file is getting vanished after generation,
          # but logging that we added in the past indicates that the problem is
          # mostly likely that this step is failing to generate.
          #
          # Because it's not yet clear *why* this step is failing to generate,
          # we add some retries as a band-aid.
          total_retries = 3
          total_retries.times do |current_retry|
            break if File.exist?(path)
            ChatClient.log(
              "File #{path.inspect} does not exist after generation; retrying (#{current_retry + 1}/#{total_retries})",
              color: 'red'
            )
            PDF.generate_from_html(page_content, path)
          end
          raise "File #{path.inspect} does not exist after generation" unless File.exist?(path)

          if DCDO.get('use-ghostscript-to-generate-pdfs', false)
            # Regenerate the PDF using Ghostscript
            optimized_path = File.join(directory, "optimized_#{filename}")
            return PDF.regenerate_pdf_with_ghostscript(optimized_path, path)
          end

          # return the original path
          return path
        end

        # Given a Resource object, persist a PDF of that Resource (with a name
        # based on the key of that Resource) to the given directory.
        def fetch_resource_pdf(resource, directory = "/tmp/")
          filename = ActiveStorage::Filename.new("resource.#{resource.key.parameterize}.pdf").to_s
          path = File.join(directory, filename)
          return path if File.exist?(path)
          return fetch_url_to_path(resource.url, path)
        end

        # Given a URL representing a Resource, persist a PDF of that resource
        # to the given path. Supports Google Docs, PDFs hosted on Google Drive,
        # and arbitrary URLs that end in ".pdf"
        def fetch_url_to_path(url, path)
          service = Drive::DriveService.new
          service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
            json_key_io: StringIO.new(CDO.gdrive_export_secret.to_json || ""),
            scope: Google::Apis::DriveV3::AUTH_DRIVE,
          )
          # because not all files will get PDFs generated (ex. google forms),
          # this checks to see if there is a PDF that should have a path
          pdf_generated_initially = false
          if url.start_with?("https://docs.google.com/document/d/")
            file_id = url_to_id(url)
            service.export_file(file_id, 'application/pdf', download_dest: path)
            pdf_generated_initially = true
          elsif url.start_with?("https://drive.google.com/")
            file_id = url_to_id(url)
            file = service.get_file(file_id)
            return nil unless file.mime_type == "application/pdf"
            service.get_file(file_id, download_dest: path)
            pdf_generated_initially = true
          elsif url.end_with?(".pdf")
            IO.copy_stream(URI.parse(url)&.open, path)
            pdf_generated_initially = true
          end

          if pdf_generated_initially
            # Regenerate the PDF using ghostscript
            if DCDO.get('use-ghostscript-to-generate-pdfs', false)
              new_path = File.join(File.dirname(path), "optimized_#{File.basename(path)}")
              return PDF.regenerate_pdf_with_ghostscript(new_path, path)
            else
              # return the path generated by gdrive service
              return path
            end
          end
        rescue Google::Apis::ClientError, Google::Apis::ServerError, GoogleDrive::Error, URI::InvalidURIError, OpenURI::HTTPError => exception
          ChatClient.log(
            "Error when trying to fetch PDF from #{url.inspect} to #{path.inspect}: #{exception.inspect}",
            color: 'yellow'
          )

          # !subteam^S07FB3XSAR5 - would notify the teacher-tools-on-call group
          ChatClient.log(
            "<!subteam^S07FB3XSAR5> Please follow instructions in https://docs.google.com/document/d/1mBY56DeAzrwTM3CVIOFho3azTi9mudE37ZQrVZXxaMA/edit#heading=h.axfu5or8cueg to troubleshoot",
            color: 'yellow'
          )
          return nil
        end

        # url_to_id(url) is borrowed from GoogleDrive api
        # The license of this software is "New BSD Licence".
        # Copyright (c) 2013, Hiroshi Ichikawa <http://gimite.net/>
        # Copyright (c) 2013, David R. Albrecht <https://github.com/eldavido>
        # Copyright (c) 2013, Guy Boertje <https://github.com/guyboertje>
        # Copyright (c) 2013, Phuogn Nguyen <https://github.com/phuongnd08>
        # All rights reserved.

        # Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

        # - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
        # - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
        # - Neither the name of Hiroshi Ichikawa nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

        # THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        # See: https://github.com/gimite/google-drive-ruby/blob/55b996b2c287cb0932824bf2474248a498469328/lib/google_drive/session.rb#L693C5-L731C8
        # Returns a file_id for a google drive doc
        def url_to_id(url)
          uri = URI.parse(url)
          if ['spreadsheets.google.com', 'docs.google.com', 'drive.google.com'].include?(uri.host)
            case uri.path
              # Document feed.
            when /^\/feeds\/\w+\/private\/full\/\w+%3A(.*)$/
              return Regexp.last_match(1)
              # Worksheets feed of a spreadsheet.
            when /^\/feeds\/worksheets\/([^\/]+)/
              return Regexp.last_match(1)
              # Human-readable new spreadsheet/document.
            when /\/d\/([^\/]+)/
              return Regexp.last_match(1)
              # Human-readable new folder page.
            when /^\/drive\/[^\/]+\/([^\/]+)/
              return Regexp.last_match(1)
              # Human-readable old folder view.
            when /\/folderview$/
              if (uri.query || '').split('&').find {|s| s =~ /^id=(.*)$/}
                return Regexp.last_match(1)
              end
              # Human-readable old spreadsheet.
            when /\/ccc$/
              if (uri.query || '').split('&').find {|s| s =~ /^key=(.*)$/}
                return Regexp.last_match(1)
              end
            end
            case uri.fragment
              # Human-readable old folder page.
            when /^folders\/(.+)$/
              return Regexp.last_match(1)
            end
          end
        end
      end
    end
  end
end
