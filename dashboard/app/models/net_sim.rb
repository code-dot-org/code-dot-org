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
end
