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
"addRouter":function(d){return "Ajouter un routeur"},
"appendCountToTitle":function(d){return appLocale.v(d,"title")+" ("+appLocale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "Noeud DNS automatique\nUtilisation: GET nom d'hôte [nom d'hôte [nom d'hôte ...]]"},
"binary":function(d){return "Binaire"},
"bitCounter":function(d){return appLocale.v(d,"x")+"/"+appLocale.v(d,"y")+" bits"},
"bits":function(d){return "bits"},
"buttonAccept":function(d){return "Accept"},
"buttonCancel":function(d){return "Annuler"},
"buttonJoin":function(d){return "Join"},
"clear":function(d){return "Réinitialiser"},
"collapse":function(d){return "Réduire"},
"connect":function(d){return "Connecter"},
"connected":function(d){return "Connecté"},
"connectedToNodeName":function(d){return "Connected to "+appLocale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Connecting to "+appLocale.v(d,"nodeName")},
"connectToANode":function(d){return "Connecter à un noeud"},
"connectToAPeer":function(d){return "Connect to a Peer"},
"connectToARouter":function(d){return "Connect to a Router"},
"decimal":function(d){return "Décimal"},
"disconnected":function(d){return "Déconnecté"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "Mode DNS"},
"dnsMode_AUTOMATIC":function(d){return "Automatique"},
"dnsMode_MANUAL":function(d){return "Manuel"},
"dnsMode_NONE":function(d){return "Aucun"},
"dropdownPickOne":function(d){return "-- SÉLECTIONNER UN ÉLÉMENT --"},
"encoding":function(d){return "Encodage"},
"expand":function(d){return "Agrandir"},
"from":function(d){return "De"},
"hex":function(d){return "Hex"},
"hexadecimal":function(d){return "Hexadécimal"},
"incomingConnectionRequests":function(d){return "Requêtes de connection entrantes"},
"infinity":function(d){return "Infini"},
"instructions":function(d){return "Consignes"},
"joinSection":function(d){return "Rejoindre la section"},
"lobby":function(d){return "Salon"},
"lobbyInstructionsForPeers":function(d){return "Find your partner in the list to the right and click the 'Join' button next to their name to create an outgoing connection request."},
"lobbyInstructionsForRouters":function(d){return "Click the 'Join' button next to any router to be added to the router. Create a new router to join by clicking the 'Add Router' button."},
"lobbyInstructionsGeneral":function(d){return "Connect with a router or a peer to begin using the simulator."},
"lobbyIsEmpty":function(d){return "Personne n'est encore ici."},
"lobbyStatusWaitingForOther":function(d){return appLocale.v(d,"spinner")+" Waiting for "+appLocale.v(d,"otherName")+" to connect... ("+appLocale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Waiting for you..."},
"logStatus_dropped":function(d){return "Perdu"},
"logStatus_success":function(d){return "Succès"},
"markAsRead":function(d){return "Marqué comme lu"},
"message":function(d){return "Message"},
"myDevice":function(d){return "Mon appareil"},
"myName":function(d){return "Mon nom"},
"myPrivateNetwork":function(d){return "Mon réseau privé"},
"mySection":function(d){return "Ma section"},
"number":function(d){return "Nombre"},
"numBitsPerPacket":function(d){return appLocale.v(d,"x")+" bits par paquet"},
"numBitsPerChunk":function(d){return appLocale.v(d,"numBits")+" bits par morceau"},
"notConnected":function(d){return "Not connected"},
"onBeforeUnloadWarning":function(d){return "You will be disconnected from the simulation."},
"outgoingConnectionRequests":function(d){return "Requêtes de connection sortantes"},
"_of_":function(d){return " sur "},
"packet":function(d){return "Paquet"},
"packetInfo":function(d){return "Info du paquet"},
"pickASection":function(d){return "Choisis une section"},
"readWire":function(d){return "Lire le fil"},
"receiveBits":function(d){return "Recevoir des bits"},
"receivedMessageLog":function(d){return "Journal des messages reçus"},
"removePacket":function(d){return "Supprimer le paquet"},
"router":function(d){return "Routeur"},
"routerStatus":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+".  Room for "+appLocale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+appLocale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "Bande passante"},
"routerTab_memory":function(d){return "Mémoire"},
"routerTab_stats":function(d){return "Statistiques"},
"routerX":function(d){return "Routeur "+appLocale.v(d,"x")},
"send":function(d){return "Envoyer"},
"sendAMessage":function(d){return "Envoyer un Message"},
"sendBits":function(d){return "Envoyer les bits"},
"sentBitsLog":function(d){return "Journal des bits envoyés"},
"sentMessageLog":function(d){return "Envoyé le journal des messages"},
"setName":function(d){return "Définir le nom"},
"setWire":function(d){return "Définir le fil"},
"setWireToValue":function(d){return "Définir le fil à "+appLocale.v(d,"value")},
"shareThisNetwork":function(d){return "Partager ce réseau"},
"size":function(d){return "Taille"},
"status":function(d){return "Statut"},
"to":function(d){return "À"},
"unknownNode":function(d){return "Unknown Node"},
"unlimited":function(d){return "Illimité"},
"waitingForNodeToConnect":function(d){return "Attend la connection du noeud "+appLocale.v(d,"node")+"..."},
"workspaceHeader":function(d){return "Simulateur d'Internet"},
"xOfYPackets":function(d){return appLocale.v(d,"x")+" sur "+appLocale.v(d,"y")},
"xSecondPerPulse":function(d){return appLocale.v(d,"x")+" seconde par pulsation"},
"xSecondsPerPulse":function(d){return appLocale.v(d,"x")+" secondes par pulsation"},
"x_Gbps":function(d){return appLocale.v(d,"x")+"Gbit/s"},
"x_Mbps":function(d){return appLocale.v(d,"x")+"Mbit/s"},
"x_Kbps":function(d){return appLocale.v(d,"x")+"Kbit/s"},
"x_bps":function(d){return appLocale.v(d,"x")+"bit/s"},
"x_GBytes":function(d){return appLocale.v(d,"x")+"Go"},
"x_MBytes":function(d){return appLocale.v(d,"x")+"Mo"},
"x_KBytes":function(d){return appLocale.v(d,"x")+"Ko"},
"x_Bytes":function(d){return appLocale.v(d,"x")+"octets"},
"x_bits":function(d){return appLocale.v(d,"x")+"bits"}};