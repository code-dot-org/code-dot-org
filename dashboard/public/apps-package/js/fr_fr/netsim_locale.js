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
"a_and_b":function(d){return "A / B"},
"addPacket":function(d){return "Ajouter le paquet"},
"addRouter":function(d){return "Add Router"},
"appendCountToTitle":function(d){return appLocale.v(d,"title")+" ("+appLocale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "Automatic DNS Node\nUsage: GET hostname [hostname [hostname ...]]"},
"binary":function(d){return "Binaire"},
"bitCounter":function(d){return appLocale.v(d,"x")+"/"+appLocale.v(d,"y")+" bits"},
"bits":function(d){return "bits"},
"cancel":function(d){return "Annuler"},
"clear":function(d){return "Réinitialiser"},
"collapse":function(d){return "Collapse"},
"connect":function(d){return "Connect"},
"connected":function(d){return "Connecté"},
"connectToANode":function(d){return "Connect to a Node"},
"decimal":function(d){return "Décimal"},
"disconnected":function(d){return "Déconnecté"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "Mode DNS"},
"dnsMode_AUTOMATIC":function(d){return "Automatique"},
"dnsMode_MANUAL":function(d){return "Manuel"},
"dnsMode_NONE":function(d){return "Aucun"},
"dropdownPickOne":function(d){return "-- PICK ONE --"},
"encoding":function(d){return "Encodage"},
"expand":function(d){return "Expand"},
"from":function(d){return "De"},
"hex":function(d){return "Hex"},
"hexadecimal":function(d){return "Hexadécimal"},
"incomingConnectionRequests":function(d){return "Incoming connection requests"},
"infinity":function(d){return "Infini"},
"instructions":function(d){return "Consignes"},
"joinSection":function(d){return "Join Section"},
"lobby":function(d){return "Lobby"},
"lobbyIsEmpty":function(d){return "Nobody's here yet."},
"logStatus_dropped":function(d){return "Dropped"},
"logStatus_success":function(d){return "Success"},
"markAsRead":function(d){return "Mark as read"},
"message":function(d){return "Message"},
"myDevice":function(d){return "Mon appareil"},
"myName":function(d){return "My Name"},
"myPrivateNetwork":function(d){return "My Private Network"},
"mySection":function(d){return "My Section"},
"number":function(d){return "Number"},
"numBitsPerPacket":function(d){return appLocale.v(d,"x")+" bits par paquet"},
"numBitsPerChunk":function(d){return appLocale.v(d,"numBits")+" bits per chunk"},
"outgoingConnectionRequests":function(d){return "Outgoing connection requests"},
"_of_":function(d){return " sur "},
"packet":function(d){return "Paquet"},
"packetInfo":function(d){return "Info du paquet"},
"pickASection":function(d){return "Pick a Section"},
"readWire":function(d){return "Read Wire"},
"receiveBits":function(d){return "Receive Bits"},
"receivedMessageLog":function(d){return "Journal des messages reçus"},
"removePacket":function(d){return "Supprimer le paquet"},
"router":function(d){return "Routeur"},
"routerTab_bandwidth":function(d){return "Bandwidth"},
"routerTab_memory":function(d){return "Memory"},
"routerTab_stats":function(d){return "Stats"},
"routerX":function(d){return "Routeur "+appLocale.v(d,"x")},
"send":function(d){return "Envoyer"},
"sendAMessage":function(d){return "Envoyer un Message"},
"sendBits":function(d){return "Send Bits"},
"sentBitsLog":function(d){return "Sent Bits Log"},
"sentMessageLog":function(d){return "Envoyé le journal des messages"},
"setName":function(d){return "Set Name"},
"setWire":function(d){return "Set Wire"},
"setWireToValue":function(d){return "Set Wire to "+appLocale.v(d,"value")},
"shareThisNetwork":function(d){return "Share this network"},
"size":function(d){return "Size"},
"status":function(d){return "Status"},
"to":function(d){return "À"},
"unlimited":function(d){return "Illimité"},
"waitingForNodeToConnect":function(d){return "Waiting for "+appLocale.v(d,"node")+" to connect..."},
"workspaceHeader":function(d){return "Simulateur d'Internet"},
"xOfYPackets":function(d){return appLocale.v(d,"x")+" sur "+appLocale.v(d,"y")},
"xSecondPerPulse":function(d){return appLocale.v(d,"x")+" second per pulse"},
"xSecondsPerPulse":function(d){return appLocale.v(d,"x")+" seconds per pulse"},
"x_Gbps":function(d){return appLocale.v(d,"x")+"Gbps"},
"x_Mbps":function(d){return appLocale.v(d,"x")+"Mbps"},
"x_Kbps":function(d){return appLocale.v(d,"x")+"Kbps"},
"x_bps":function(d){return appLocale.v(d,"x")+"bps"},
"x_GBytes":function(d){return appLocale.v(d,"x")+"GB"},
"x_MBytes":function(d){return appLocale.v(d,"x")+"MB"},
"x_KBytes":function(d){return appLocale.v(d,"x")+"KB"},
"x_Bytes":function(d){return appLocale.v(d,"x")+"B"},
"x_bits":function(d){return appLocale.v(d,"x")+"b"}};