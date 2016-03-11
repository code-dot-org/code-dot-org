require 'json'

module Solr

  class Server

    def initialize(params={})
      @host, @port = params[:host].to_s.split(':').map(&:strip)
      @port ||= '8983'
      @http = Net::HTTP.new(@host, @port)
    end

    def update(documents)
      request = Net::HTTP::Post.new('/solr/update?commit=true')
      request.body = documents.to_json
      request.add_field('Content-Type', 'application/json')
      response = @http.request(request)
      raise response.body unless response.code == '200'
    end

    def delete_by_id(id)
      request = Net::HTTP::Post.new('/solr/update?commit=true')
      request.body = "<delete><query>id:#{id}</query></delete>"
      request.add_field('Content-Type', 'application/xml')
      response = @http.request(request)
      raise response.body unless response.code == '200'
    end

    def query(params)
      Query.new(@http, params.merge(omitHeader: true))
    end

    class Query
      include Enumerable

      def initialize(http, params)
        @http = http
        @params = params.dup
        @start, @count, @docs = fetch(params[:start]||0)
      end

      def count()
        @count
      end

      def each(&block)
        while (@start < @count)
          @start, @count, @docs = fetch(@start) if @docs.empty?
          yield(@docs.shift)
          @start += 1
        end
      end

      private

      def fetch(start=0)
        post = Net::HTTP::Post.new('/solr/query')
        post.set_form_data(@params.merge(start: start))
        response = @http.request(post)
        raise response.body unless response.code == '200'
        response = JSON.parse(response.body)['response']
        [response['start'].to_i, response['numFound'].to_i, response['docs']]
      end
    end
  end
end
