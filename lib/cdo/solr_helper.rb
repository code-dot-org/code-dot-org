require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'cdo/chat_client'
require 'cdo/geocoder'
require 'cdo/solr'
require src_dir 'forms'

module SolrHelper
  # @param [String] The type of SOLR entry whose ID is being queried.
  # @param [Integer] The DB ID of the entry being queried.
  # @return [String] The SOLR ID of the entry being queried.
  # @raises [ArgumentError] If type is not recognized.
  def self.get_solr_id_from_db_id(type, db_id)
    case type
    when 'form'
      return db_id
    when 'user'
      return "user-#{db_id}"
    end
    raise ArgumentError, "invalid type (#{type})"
  end

  def self.update_document_type_form(solr_server, db_id, solr_id)
    # TODO(asher): Refactor this and the code in bin/cron/process_forms to a
    # shared method.
    db_form = DB[:forms].where(id: db_id).first

    kind = Object.const_get(db_form[:kind])
    begin
      solr_form_doc = JSON.load(db_form[:data]).
        merge(JSON.load(db_form[:processed_data])).
        merge(
          {
            id: db_form[:id],
            kind_s: db_form[:kind],
            review_s: db_form[:review],
            user_i: db_form[:user_id],
            parent_db_form_i: db_form[:parent_id]
          }
        )
      solr_form_doc = kind.index(solr_form_doc) if kind.respond_to?(:index)

      address_to_search = solr_form_doc['school_address_s'].to_s.strip
      address_to_search = solr_form_doc['zip_code_s'].to_s.strip if address_to_search.empty?
      address_to_search = db_form[:created_ip].to_s.strip if address_to_search.empty?
      location = Geocoder.search(address_to_search).first
      if location
        solr_form_doc['create_ip_city_s'] = location.city
        solr_form_doc['create_ip_state_s'] = location.state
        solr_form_doc['create_ip_country_s'] = location.country
        solr_form_doc['create_ip_postal_code_s'] = location.postal_code
        solr_form_doc['create_ip_location_p'] = "#{location.latitude},#{location.longitude}" if location.latitude && location.longitude
      end
    rescue
      ChatClient.log "Form #{db_form[:id]} couldn't be indexed."
      return
    end

    solr_server.update([solr_form_doc])
    DB[:forms].where(id: db_id).update(indexed_at: DateTime.now)
  end

  def self.update_document_type_user(solr_server, db_id, solr_id)
    db_user = DASHBOARD_DB[:users].where(id: db_id).first

    # TODO(asher): Refactor this and the code in bin/index-users-in-solr to a
    # shared method.
    solr_user_doc = {
      id: solr_id,
      name_s: db_user[:name],
      email_s: db_user[:email],
      kind_s: 'user',
      role_s: db_user[:user_type]
    }
    location = Geocoder.search(db_user[:current_sign_in_ip]).first
    if location
      solr_user_doc['create_ip_city_s'] = location.city
      solr_user_doc['create_ip_state_s'] = location.state
      solr_user_doc['create_ip_country_s'] = location.country
      solr_user_doc['create_ip_postal_code_s'] = location.postal_code
      solr_user_doc['create_ip_location_p'] = "#{location.latitude},#{location.longitude}" if location.latitude && location.longitude
    end

    solr_server.update([solr_user_doc])
  end

  def self.delete_document(solr_server, type, db_id)
    solr_id = get_solr_id_from_db_id(type, db_id)
    unless solr_id.nil?
      ChatClient.log "DELETING SOLR DOCUMENT: #{solr_id}..."
      solr_server.delete_by_id(solr_id)
    end
  end

  def self.update_document(solr_server, type, db_id)
    solr_id = get_solr_id_from_db_id(type, db_id)
    unless solr_id.nil?
      ChatClient.log "UPDATING SOLR DOCUMENT: #{solr_id}..."
      case type
      when 'form'
        SolrHelper.update_document_type_form(solr_server, db_id, solr_id)
      when 'user'
        SolrHelper.update_document_type_user(solr_server, db_id, solr_id)
      end
    end
  end
end
