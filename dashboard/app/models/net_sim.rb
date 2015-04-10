class NetSim < Blockly
  serialized_attrs %w(
    show_clients_in_lobby
    show_routers_in_lobby
    can_connect_to_clients
    can_connect_to_routers
    show_add_router_button
    router_expects_packet_header
    client_initial_packet_header
    show_add_packet_button
    show_packet_size_control
    default_packet_size_limit
    show_tabs
    default_tab_index
    show_encoding_controls
    default_enabled_encodings
    show_router_bandwidth_control
    default_router_bandwidth
    show_router_memory_control
    default_router_memory
    show_dns_mode_control
    default_dns_mode
  )

  # Attributes that are stored as JSON strings but should be passed through to the app as
  # actual JSON objects.  You can list attributes in snake_case here for consistency, but this method
  # returns camelCase properties because of where it's used in the pipeline.
  def self.json_object_attrs
    %w(
      router_expects_packet_header
      client_initial_packet_header
      show_tabs
      show_encoding_controls
      default_enabled_encodings
    ).map{ |x| x.camelize(:lower) }
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['netsim']
  end

  # DNS modes, used by levelbuilder
  def self.dns_modes
    %w( none manual automatic )
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
              user: params[:user],
              game: Game.netsim,
              level_num: 'custom'
            ))
  end
end
