var netsim_locale = {lc:{"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"ur":function(n){return n===1?"one":"other"},"vi":function(n){return "other"},"zh":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){netsim_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){netsim_locale.c(d,k);return d[k] in p?p[d[k]]:(k=netsim_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){netsim_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).netsim_locale = {
"a_and_b":function(d){return "A/B"},
"addPacket":function(d){return "Add Packet"},
"addRoom":function(d){return "Add Room"},
"addRouter":function(d){return "Add Router"},
"addRouterToLobbyError":function(d){return "Could not create a new router. Please try again."},
"appendCountToTitle":function(d){return netsim_locale.v(d,"title")+" ("+netsim_locale.v(d,"count")+")"},
"alertPartnerDisconnected":function(d){return "Your partner disconnected"},
"alertConnectionRefused":function(d){return "The partner you were trying to connect to has connected to someone else"},
"alertConnectionReset":function(d){return "The simulation was restarted.  Returning to the lobby..."},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "Automatic DNS Node\nUsage: GET hostname [hostname [hostname ...]]"},
"binary":function(d){return "Binary"},
"bitCounter":function(d){return netsim_locale.v(d,"x")+"/"+netsim_locale.v(d,"y")+" bits"},
"bits":function(d){return "Bits"},
"buttonAccept":function(d){return "Accept"},
"buttonCancel":function(d){return "Cancel"},
"buttonFull":function(d){return "Full"},
"buttonJoin":function(d){return "Join"},
"clear":function(d){return "Clear"},
"collapse":function(d){return "Collapse"},
"connect":function(d){return "Connect"},
"connected":function(d){return "Connected"},
"connectedToNodeName":function(d){return "Connected to "+netsim_locale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Connecting to "+netsim_locale.v(d,"nodeName")},
"connectToANode":function(d){return "Connect to a Node"},
"connectToAPeer":function(d){return "Connect to a Peer"},
"connectToARoom":function(d){return "Connect to a Room"},
"connectToARouter":function(d){return "Connect to a Router"},
"continueButton":function(d){return "Finished! "+netsim_locale.v(d,"caret")},
"createMyClientNodeError":function(d){return "Could not connect to the simulation at this time. Please try again."},
"decimal":function(d){return "Decimal"},
"defaultNodeName":function(d){return "[New Node]"},
"disconnectButton":function(d){return netsim_locale.v(d,"caret")+" Disconnect"},
"disconnected":function(d){return "Disconnected"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "DNS Mode"},
"dnsMode_AUTOMATIC":function(d){return "Automatic"},
"dnsMode_MANUAL":function(d){return "Manual"},
"dnsMode_NONE":function(d){return "None"},
"dropdownPickOne":function(d){return "-- PICK ONE --"},
"encoding":function(d){return "Encoding"},
"expand":function(d){return "Expand"},
"from":function(d){return "From"},
"hex":function(d){return "Hex"},
"hexadecimal":function(d){return "Hexadecimal"},
"incomingConnectionRequests":function(d){return "Incoming connection requests"},
"infinity":function(d){return "Infinity"},
"instructions":function(d){return "Instructions"},
"joinSection":function(d){return "Join Section"},
"lobby":function(d){return "Lobby"},
"lobbyInstructionsForPeers":function(d){return "Find your partner in the list to the right and click the 'Join' button next to their name to create an outgoing connection request."},
"lobbyInstructionsForRooms":function(d){return "Click the 'Join' button next to any room to be added to the room.  Create a new room to join by clicking the 'Add Room' button."},
"lobbyInstructionsForRouters":function(d){return "Click the 'Join' button next to any router to be added to the router. Create a new router to join by clicking the 'Add Router' button."},
"lobbyInstructionsGeneral":function(d){return "Connect with a router or a peer to begin using the simulator."},
"lobbyIsEmpty":function(d){return "Nobody's here yet."},
"lobbyStatusWaitingForOther":function(d){return netsim_locale.v(d,"spinner")+" Waiting for "+netsim_locale.v(d,"otherName")+" to connect... ("+netsim_locale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Waiting for you..."},
"logBrowserButton":function(d){return "Log Browser"},
"logBrowserHeader":function(d){return "All Router Logs"},
"logBrowserHeader_all":function(d){return "All Router Logs"},
"logBrowserHeader_mine":function(d){return "My Router Logs"},
"logBrowserHeader_toggleAll":function(d){return "show all routers"},
"logBrowserHeader_toggleMine":function(d){return "show my router"},
"logStatus_dropped":function(d){return "Dropped"},
"logStatus_success":function(d){return "Success"},
"loggedByNode":function(d){return "Logged By"},
"markAsRead":function(d){return "Mark as read"},
"message":function(d){return "Message"},
"myDevice":function(d){return "My Device"},
"myName":function(d){return "My Name"},
"myPrivateNetwork":function(d){return "My Private Network"},
"mySection":function(d){return "My Section"},
"number":function(d){return "Number"},
"numBitsPerPacket":function(d){return netsim_locale.v(d,"numBits")+" bits per packet"},
"numBitsPerChunk":function(d){return netsim_locale.v(d,"numBits")+" bits per chunk"},
"notConnected":function(d){return "In lobby"},
"onBeforeUnloadWarning":function(d){return "You will be disconnected from the simulation."},
"outgoingConnectionRequests":function(d){return "Outgoing connection requests"},
"_of_":function(d){return " of "},
"packet":function(d){return "Packet"},
"packetInfo":function(d){return "Packet Info"},
"pickASection":function(d){return "Pick a Section"},
"readWire":function(d){return "Read Wire"},
"receiveBits":function(d){return "Receive Bits"},
"receivedMessageLog":function(d){return "Received Message Log"},
"removePacket":function(d){return "Remove Packet"},
"roomStatus":function(d){return netsim_locale.v(d,"connectedClients")+". Room for "+netsim_locale.v(d,"remainingSpace")+" more."},
"roomStatusFull":function(d){return netsim_locale.v(d,"connectedClients")+"."},
"roomStatusNoConnections":function(d){return "Up to "+netsim_locale.v(d,"maximumClients")+" people may join."},
"roomNumberX":function(d){return "Room "+netsim_locale.v(d,"x")},
"router":function(d){return "Router"},
"routerLimitReachedError":function(d){return "Router limit reached."},
"routerStatus":function(d){return "Connected to "+netsim_locale.v(d,"connectedClients")+".  Room for "+netsim_locale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+netsim_locale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+netsim_locale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "Bandwidth"},
"routerTab_memory":function(d){return "Memory"},
"routerTab_stats":function(d){return "Stats"},
"routerTab_logs":function(d){return "Logs"},
"routerNumberX":function(d){return "Router "+netsim_locale.v(d,"x")},
"send":function(d){return "Send"},
"sendAMessage":function(d){return "Send a Message"},
"sendBits":function(d){return "Send Bits"},
"sendMessageError":function(d){return "Message could not be sent. Please try again."},
"sentBitsLog":function(d){return "Sent Bits Log"},
"sentMessageLog":function(d){return "Sent Message Log"},
"setName":function(d){return "Set Name"},
"setWire":function(d){return "Set Wire"},
"setWireToValue":function(d){return "Set Wire to "+netsim_locale.v(d,"value")},
"shardResetButton":function(d){return "Reset Simulation"},
"shardResetConfirmation":function(d){return "This will kick everyone out and reset all data for the class. Are you sure?"},
"shardResetError":function(d){return "You do not have permission to perform that action."},
"shareThisNetwork":function(d){return "Share this network"},
"showingFirstXLogEntries":function(d){return "Showing first "+netsim_locale.v(d,"x")+" log entries.  Sort/filter to see more."},
"size":function(d){return "Size"},
"status":function(d){return "Status"},
"time":function(d){return "Time"},
"to":function(d){return "To"},
"unknownNode":function(d){return "Unknown Node"},
"unlimited":function(d){return "Unlimited"},
"waitingForNodeToConnect":function(d){return "Waiting for "+netsim_locale.v(d,"node")+" to connect..."},
"workspaceHeader":function(d){return "Internet Simulator"},
"xOfYPackets":function(d){return netsim_locale.v(d,"x")+" of "+netsim_locale.v(d,"y")},
"xSecondPerPulse":function(d){return netsim_locale.v(d,"x")+" second per pulse"},
"xSecondsPerPulse":function(d){return netsim_locale.v(d,"x")+" seconds per pulse"},
"x_Gbps":function(d){return netsim_locale.v(d,"x")+"Gbps"},
"x_Mbps":function(d){return netsim_locale.v(d,"x")+"Mbps"},
"x_Kbps":function(d){return netsim_locale.v(d,"x")+"Kbps"},
"x_bps":function(d){return netsim_locale.v(d,"x")+"bps"},
"x_GBytes":function(d){return netsim_locale.v(d,"x")+"GB"},
"x_MBytes":function(d){return netsim_locale.v(d,"x")+"MB"},
"x_KBytes":function(d){return netsim_locale.v(d,"x")+"KB"},
"x_Bytes":function(d){return netsim_locale.v(d,"x")+"B"},
"x_bits":function(d){return netsim_locale.v(d,"x")+"b"}};