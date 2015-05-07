var appLocale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"a_and_b":function(d){return "A/B"},
"addPacket":function(d){return "Paket hinzufügen"},
"addRouter":function(d){return "Add Router"},
"appendCountToTitle":function(d){return appLocale.v(d,"title")+" ("+appLocale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "Automatische DNS-Knoten Verwendung: GET Hostname [Hostname [Hostname...]]"},
"binary":function(d){return "Binary"},
"bitCounter":function(d){return appLocale.v(d,"x")+"/"+appLocale.v(d,"y")+"-bits"},
"bits":function(d){return "Bits"},
"buttonAccept":function(d){return "Accept"},
"buttonCancel":function(d){return "Abbrechen"},
"buttonJoin":function(d){return "Join"},
"clear":function(d){return "Löschen"},
"collapse":function(d){return "Collapse"},
"connect":function(d){return "Connect"},
"connected":function(d){return "Verbunden"},
"connectedToNodeName":function(d){return "Connected to "+appLocale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Connecting to "+appLocale.v(d,"nodeName")},
"connectToANode":function(d){return "Connect to a Node"},
"connectToAPeer":function(d){return "Connect to a Peer"},
"connectToARouter":function(d){return "Connect to a Router"},
"decimal":function(d){return "Dezimalzahl"},
"disconnected":function(d){return "Getrennt"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "DNS-Modus"},
"dnsMode_AUTOMATIC":function(d){return "Automatisch"},
"dnsMode_MANUAL":function(d){return "Manual"},
"dnsMode_NONE":function(d){return "None"},
"dropdownPickOne":function(d){return "-- PICK ONE --"},
"encoding":function(d){return "Codierung"},
"expand":function(d){return "Expand"},
"from":function(d){return "von"},
"hex":function(d){return "Hex"},
"hexadecimal":function(d){return "Hexadezimal"},
"incomingConnectionRequests":function(d){return "Incoming connection requests"},
"infinity":function(d){return "Unendlichkeit"},
"instructions":function(d){return "Anweisungen"},
"joinSection":function(d){return "Join Section"},
"lobby":function(d){return "Lobby"},
"lobbyInstructionsForPeers":function(d){return "Find your partner in the list to the right and click the 'Join' button next to their name to create an outgoing connection request."},
"lobbyInstructionsForRouters":function(d){return "Click the 'Join' button next to any router to be added to the router. Create a new router to join by clicking the 'Add Router' button."},
"lobbyInstructionsGeneral":function(d){return "Connect with a router or a peer to begin using the simulator."},
"lobbyIsEmpty":function(d){return "Nobody's here yet."},
"lobbyStatusWaitingForOther":function(d){return appLocale.v(d,"spinner")+" Waiting for "+appLocale.v(d,"otherName")+" to connect... ("+appLocale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Waiting for you..."},
"logStatus_dropped":function(d){return "Dropped"},
"logStatus_success":function(d){return "Success"},
"markAsRead":function(d){return "Mark as read"},
"message":function(d){return "Nachricht"},
"myDevice":function(d){return "Mein Gerät"},
"myName":function(d){return "My Name"},
"myPrivateNetwork":function(d){return "My Private Network"},
"mySection":function(d){return "My Section"},
"number":function(d){return "Number"},
"numBitsPerPacket":function(d){return appLocale.v(d,"x")+" bits per packet"},
"numBitsPerChunk":function(d){return appLocale.v(d,"numBits")+" bits per chunk"},
"notConnected":function(d){return "Not connected"},
"onBeforeUnloadWarning":function(d){return "You will be disconnected from the simulation."},
"outgoingConnectionRequests":function(d){return "Outgoing connection requests"},
"_of_":function(d){return " von "},
"packet":function(d){return "Paket"},
"packetInfo":function(d){return "Paket-Info"},
"pickASection":function(d){return "Pick a Section"},
"readWire":function(d){return "Read Wire"},
"receiveBits":function(d){return "Receive Bits"},
"receivedMessageLog":function(d){return "Verlauf der erhaltenen Nachrichten"},
"removePacket":function(d){return "Remove Packet"},
"router":function(d){return "Router"},
"routerStatus":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+".  Room for "+appLocale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+appLocale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "Bandwidth"},
"routerTab_memory":function(d){return "Memory"},
"routerTab_stats":function(d){return "Stats"},
"routerX":function(d){return "Router "+appLocale.v(d,"x")},
"send":function(d){return "Senden"},
"sendAMessage":function(d){return "Eine Nachricht senden"},
"sendBits":function(d){return "Send Bits"},
"sentBitsLog":function(d){return "Sent Bits Log"},
"sentMessageLog":function(d){return "Verlauf der gesendeten Nachrichten"},
"setName":function(d){return "Set Name"},
"setWire":function(d){return "Set Wire"},
"setWireToValue":function(d){return "Set Wire to "+appLocale.v(d,"value")},
"shareThisNetwork":function(d){return "Share this network"},
"size":function(d){return "Size"},
"status":function(d){return "Status"},
"to":function(d){return "An"},
"unknownNode":function(d){return "Unknown Node"},
"unlimited":function(d){return "Unbegrenzt"},
"waitingForNodeToConnect":function(d){return "Waiting for "+appLocale.v(d,"node")+" to connect..."},
"workspaceHeader":function(d){return "Internet-Simulator"},
"xOfYPackets":function(d){return appLocale.v(d,"x")+" of "+appLocale.v(d,"y")},
"xSecondPerPulse":function(d){return appLocale.v(d,"x")+" second per pulse"},
"xSecondsPerPulse":function(d){return appLocale.v(d,"x")+" seconds per pulse"},
"x_Gbps":function(d){return appLocale.v(d,"x")+"Gbps"},
"x_Mbps":function(d){return appLocale.v(d,"x")+"Mb/s"},
"x_Kbps":function(d){return appLocale.v(d,"x")+"Kb/s"},
"x_bps":function(d){return appLocale.v(d,"x")+"b/s"},
"x_GBytes":function(d){return appLocale.v(d,"x")+"GB"},
"x_MBytes":function(d){return appLocale.v(d,"x")+"MB"},
"x_KBytes":function(d){return appLocale.v(d,"x")+"KB"},
"x_Bytes":function(d){return appLocale.v(d,"x")+"B"},
"x_bits":function(d){return appLocale.v(d,"x")+"b"}};