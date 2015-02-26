# Customized serializer adapter to output API objects in expected format.
class CDOJson < ActiveModel::Serializer::Adapter
  def serializable_hash(options = {})
    if serializer.respond_to?(:each)
      @result = serializer.map { |s| self.class.new(s).serializable_hash }
    else
      @result = cached_object do
        @hash = serializer.attributes(options)
        serializer.each_association do |name, association, opts|
          if association.respond_to?(:each)
            array_serializer = association
            # Serialized structure of array associations: {"teachers" : { "20": { "id": 20 } } }
            @hash[name] = {}.tap do |hash|
              array_serializer.each do |item|
                attrs = item.attributes(opts)
                hash[attrs[:id].to_i] = attrs
              end
            end
          else
            if association
              @hash[name] = association.attributes(options)
            else
              @hash[name] = nil
            end
          end
        end
        @hash
      end
    end

    if (root = options.fetch(:root, serializer.json_key))
      @result = {root => @result}
    end

    @result
  end
end

ActiveModel::Serializer.config.adapter = CDOJson
