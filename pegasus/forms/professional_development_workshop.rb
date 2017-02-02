require 'cdo/date'
require 'cdo/activity_constants'
require 'cdo/aws/s3'

class ProfessionalDevelopmentWorkshop
  MINIMUM_ATTENDEE_LEVELS_COUNT = 10

  def self.normalize(data)
    result = {}

    result[:dates] = required data[:dates]
    result[:location_name_s] = required stripped data[:location_name_s]
    result[:location_address_s] = required stripped data[:location_address_s]
    result[:grade_level_s] = 'K-5'
    result[:type_s] = required enum(data[:type_s].to_s.strip, ['Public', 'Private', 'District'])
    result[:capacity_s] = required stripped data[:capacity_s]
    result[:notes_s] = stripped data[:notes_s]
    result[:section_id_s] = stripped data[:section_id_s]

    # Email and name come from the dashboard user.
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = stripped data[:name_s]

    if data[:stopped]
      result[:stopped_dt] = DateTime.now.to_solr
    end

    result
  end

  def self.receipt
    'workshop_receipt'
  end

  def self.progress_snapshot(section_id)
    DASHBOARD_DB[:followers].
      join(:users, id: :student_user_id).
      select(Sequel.as(:student_user_id, :id),
        :users__id___id,
        :users__name___name,
        :users__email___email,
      ).
      where(section_id: section_id).
      all.map do |result|
        levels = DashboardStudent.completed_levels(result[:id])
        result[:levels] = levels.all
        result[:levels_count] = levels.count
        result
      end
  end

  # TODO: Move this to a helper.
  def self.uploaded_data(name, value)
    return value if value.class == FieldError
    AWS::S3.upload_to_bucket('cdo-form-uploads', name, value)
  end

  def self.process_(row)
    data = JSON.parse(row[:data])
    last_processed_data = JSON.parse(row[:processed_data])

    {}.tap do |results|
      location = search_for_address(data['location_address_s'])
      results.merge! location.to_solr if location

      if data['stopped_dt'] && (last_processed_data.blank? || last_processed_data['progress_snapshot_t'].blank?)
        snapshot = progress_snapshot(data['section_id_s'])
        results['total_attendee_count_i'] = snapshot.count
        results['qualifying_attendee_count_i'] = snapshot.count {|u| u[:levels_count] >= MINIMUM_ATTENDEE_LEVELS_COUNT}

        results['progress_snapshot_t'] = uploaded_data "workshop-progress-snapshot-#{data['section_id_s']}", snapshot.to_json

        recipients = snapshot.map{|snapshot_row| {email: snapshot_row[:email], name: snapshot_row[:name]}}
        recipients.each do |recipient|
          begin
            Poste2.send_message('professional-development-workshop-section-receipt',
              Poste2.ensure_recipient(recipient[:email], name: recipient[:name], ip_address: '127.0.0.1'),
              workshop_id: row[:id],
              location_name: data['location_name_s'],
              facilitator_name: data['name_s'],
              start_date: data['dates'] && data['dates'].first ? data['dates'].first['date_s'] : nil)
          rescue => e
            puts "#{recipient[:name]} <#{recipient[:email]}> couldn't be sent a pd certificate because: #{e.message}"
          end
        end
      end
    end
  end

  def self.index(data)
    data = data.dup

    data['dates_ss'] = [].tap do |results|
      data['dates'].each do |date|
        results << date['date_s'] + ", " + date['start_time_s'] + " - " + date['end_time_s']
      end
    end

    if first_date = data['dates'].first
      datetime = first_date['date_s'] + ' ' + first_date['start_time_s']
      data['first_date_dt'] = Chronic.parse(datetime).strftime('%FT%TZ')
    end

    data.delete('dates')

    # Removed temporarily.
    data.delete('stopped_dt')

    data.delete('progress_snapshot_t')

    data
  end

  def self.solr_query(params)
    fq = {
      kind_s: name,
      type_s: 'Public',
      first_date_dt: '[NOW TO *]',
    }.map{|key, value| "#{key}:#{value}"}.join(' AND ')

    fl = 'location_p,location_name_p,location_name_s,dates_ss,id'

    {
      q: "*:*",
      fq: fq,
      fl: fl,
      rows: 800,
      sort: 'first_date_dt asc',
    }
  end
end
