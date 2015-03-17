class NetSim < Blockly
  serialized_attrs %w(
    show_clients_in_lobby
    show_routers_in_lobby
    show_add_router_button
    show_packet_size_control
    default_packet_size_limit
    show_tabs
    default_tab_index
    show_encoding_controls
    default_enabled_encodings
    show_dns_mode_control
    default_dns_mode
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['netsim']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
                user: params[:user],
                game: Game.netsim,
                level_num: 'default'
            ))
  end
end
