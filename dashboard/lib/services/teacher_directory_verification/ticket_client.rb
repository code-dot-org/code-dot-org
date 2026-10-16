require 'httparty'

module Services
  module TeacherDirectoryVerification
    class TicketClient
      BASE_URL = 'https://codeorg.zendesk.com/api/v2'.freeze
      USERNAME = 'dev@code.org/token'.freeze

      class SubmissionError < StandardError
        attr_reader :status_code

        def initialize(status_code)
          @status_code = status_code
          super("Zendesk ticket request failed with status #{status_code}")
        end
      end

      def self.create_for(verification_request)
        credentials = {username: USERNAME, password: Dashboard::Application.config.zendesk_dev_token}
        existing_ticket = find_by_external_id(verification_request.ticket_external_id, credentials)
        return existing_ticket if existing_ticket

        ticket = {
          external_id: verification_request.ticket_external_id,
          requester: {
            name: verification_request.user.name.presence || verification_request.email,
            email: verification_request.email,
          },
          subject: 'Teacher verification request',
          comment: {
            public: false,
            body: [
              'A teacher requested manual review after an exact email match in an approved school staff directory.',
              "Teacher email: #{verification_request.evidence_email}",
              "School: #{verification_request.school_name} (NCES ID #{verification_request.school_id})",
              "Directory: #{verification_request.evidence_title.presence || verification_request.evidence_url}",
              "Source URL: #{verification_request.evidence_url}",
              "Verification request reference: #{verification_request.ticket_external_id}",
            ].join("\n"),
          },
        }
        group_id = DCDO.get('teacher_directory_verification_zendesk_group_id', nil)
        ticket[:group_id] = group_id.to_i if group_id.to_s.match?(/\A\d+\z/)
        default_tags = %w(teacher_verification school_directory)
        tags = DCDO.get('teacher_directory_verification_zendesk_tags', default_tags)
        valid_tags = tags.is_a?(Array) && tags.all? {|tag| tag.is_a?(String) && tag.match?(/\A[a-z0-9_]+\z/)}
        ticket[:tags] = valid_tags ? tags : default_tags

        response = HTTParty.post(
          "#{BASE_URL}/tickets.json",
          headers: {'Content-Type' => 'application/json', 'Accept' => 'application/json'},
          basic_auth: credentials,
          timeout: 10,
          body: {ticket: ticket}.to_json,
        )
        raise SubmissionError, response.code unless response.success?

        response.parsed_response.dig('ticket', 'id').to_s.presence ||
          raise(SubmissionError, response.code)
      end

      def self.find_by_external_id(external_id, credentials)
        response = HTTParty.get(
          "#{BASE_URL}/search.json",
          query: {query: "type:ticket external_id:#{external_id}"},
          headers: {'Accept' => 'application/json'},
          basic_auth: credentials,
          timeout: 10,
        )
        raise SubmissionError, response.code unless response.success?

        ticket = response.parsed_response.fetch('results', []).find do |result|
          result['external_id'] == external_id
        end
        ticket && ticket['id'].to_s
      end
      private_class_method :find_by_external_id
    end
  end
end
