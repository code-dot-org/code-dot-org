<%
  secret = request.splat_path_info[1..-1]
  district = DB[:cdo_ops_action_items].where(secret_s:secret).first
%>

# Welcome <%= district[:name_s] %>

<% if district[:contract_signed_b] %>
## Contract Signed.
<% else %>
## Sign your contract!

You need to sign this, dude.
<% end %>
