require 'cdo/google/drive'

# Squash an unhelpful warning that's causing a Honeybadger error when we use
# this module in a cronjob, because the cronjob helper sends an HB error if
# any unexpected output to STDERR occurs.
# see https://github.com/nahi/httpclient/issues/252#issuecomment-302427338
# If we end up using Google::Sheets very broadly, it might be better for this
# monkeypatch to live in our bin/cronjob helper instead.
class WebAgent
  class Cookie < HTTP::Cookie
    def domain
      original_domain
    end
  end
end

module Google
  class Sheet
    def initialize(document_key)
      @drive = Google::Drive.new service_account_key: StringIO.new(CDO.gdrive_export_secret.to_json)
      @document_key = document_key
    end

    def export(tab_name:, rows:)
      # Write exported data to a sheet in the document
      @drive.update_sheet rows, @document_key, "#{tab_name} (auto)"

      # Write new metadata to a second sheet in the document
      last_updated = DateTime.now.in_time_zone ActiveSupport::TimeZone.new "Pacific Time (US & Canada)"
      metadata = <<~META.split("\n").map {|line| [line]}
        AUTOMATION METADATA

        The tabs "#{tab_name} (auto)" and "#{tab_name}_meta (auto)" are auto-generated;
        Any edits you make to them (besides formatting) may be lost.

        Last updated: #{last_updated.strftime '%Y-%m-%d %l:%M%P GMT%:::z'}
        Written by: #{CDO.gdrive_export_secret.client_email}
        Rows: #{rows.length - 1}

        Parts of this Google Sheet are auto-populated from our live application by an automated process.
        The sheet is shared with a \"service account\" that updates it on the application's behalf.
        (Technical Details: https://github.com/code-dot-org/code-dot-org/pull/32597)
      META
      @drive.update_sheet metadata, @document_key, "#{tab_name}_meta (auto)"
    end

    def notify_of_external_sharing(allowed_list=[])
      # List of external emails that we can share this document with.
      external_emails = external_emails_with_access - allowed_list

      if external_emails.present?
        email_domains = external_emails.map {|email| email.slice(/@.*/)}.uniq
        error_msg = <<~ERROR_MSG
          A Google Sheet containing PII information is shared to
          #{external_emails.length} external account(s) at the following domain(s): #{email_domains.join(', ')}.
          Please check with PLC team that this is intentional!
        ERROR_MSG

        Honeybadger.notify error_msg
        puts error_msg
      end
    end

    private

    # Returns a list of email addresses of individuals who have been granted access
    # to the document who are not:
    #   - @code.org accounts
    #   - The configured gsheet writer service account
    def external_emails_with_access
      acl = @drive.get_spreadsheet_acl @document_key
      emails = []
      acl.each do |entry|
        email = entry.email_address
        next if email.blank? ||
          email.end_with?('@code.org') ||
          email == CDO.gdrive_export_secret.client_email
        emails << email
      end
      emails
    end
  end
end
