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
"a_and_b":function(d){return "А / B"},
"addPacket":function(d){return "Добавяне на пакет"},
"addRouter":function(d){return "Добавяне на рутер"},
"appendCountToTitle":function(d){return appLocale.v(d,"title")+" ("+appLocale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "Автоматична DNS връзка\nупотреба: ВЗЕМИ име на хост  [hostname [hostname...]]"},
"binary":function(d){return "Двоичен код"},
"bitCounter":function(d){return appLocale.v(d,"x")+"/"+appLocale.v(d,"y")+" бита"},
"bits":function(d){return "Бита"},
"buttonAccept":function(d){return "Accept"},
"buttonCancel":function(d){return "Отказ"},
"buttonJoin":function(d){return "Join"},
"clear":function(d){return "Изчисти"},
"collapse":function(d){return "Колапс"},
"connect":function(d){return "Свързване"},
"connected":function(d){return "Има връзка"},
"connectedToNodeName":function(d){return "Connected to "+appLocale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Connecting to "+appLocale.v(d,"nodeName")},
"connectToANode":function(d){return "Свързване към възел"},
"connectToAPeer":function(d){return "Connect to a Peer"},
"connectToARouter":function(d){return "Connect to a Router"},
"decimal":function(d){return "Десетичен знак"},
"disconnected":function(d){return "Изключен"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "Режим на DNS"},
"dnsMode_AUTOMATIC":function(d){return "Автоматично"},
"dnsMode_MANUAL":function(d){return "Ръчно"},
"dnsMode_NONE":function(d){return "Без"},
"dropdownPickOne":function(d){return "--ИЗБЕРЕТЕ ЕДИН--"},
"encoding":function(d){return "Кодиране"},
"expand":function(d){return "Разширяване"},
"from":function(d){return "от"},
"hex":function(d){return "Магия"},
"hexadecimal":function(d){return "Шестнадесетичен"},
"incomingConnectionRequests":function(d){return "Искане за входяща връзка"},
"infinity":function(d){return "Безкрайност"},
"instructions":function(d){return "Инструкции"},
"joinSection":function(d){return "Присъединете се към раздел"},
"lobby":function(d){return "Лоби"},
"lobbyInstructionsForPeers":function(d){return "Find your partner in the list to the right and click the 'Join' button next to their name to create an outgoing connection request."},
"lobbyInstructionsForRouters":function(d){return "Click the 'Join' button next to any router to be added to the router. Create a new router to join by clicking the 'Add Router' button."},
"lobbyInstructionsGeneral":function(d){return "Connect with a router or a peer to begin using the simulator."},
"lobbyIsEmpty":function(d){return "Никой не е тук още."},
"lobbyStatusWaitingForOther":function(d){return appLocale.v(d,"spinner")+" Waiting for "+appLocale.v(d,"otherName")+" to connect... ("+appLocale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Waiting for you..."},
"logStatus_dropped":function(d){return "Отпаднали"},
"logStatus_success":function(d){return "Успех"},
"markAsRead":function(d){return "Маркирай като прочетено"},
"message":function(d){return "Съобщение"},
"myDevice":function(d){return "Моето устройство"},
"myName":function(d){return "Моето име"},
"myPrivateNetwork":function(d){return "Моята частна мрежа"},
"mySection":function(d){return "Моят раздел"},
"number":function(d){return "Номер"},
"numBitsPerPacket":function(d){return appLocale.v(d,"x")+" бита на пакет"},
"numBitsPerChunk":function(d){return appLocale.v(d,"numBits")+" бита на парче"},
"notConnected":function(d){return "Not connected"},
"onBeforeUnloadWarning":function(d){return "You will be disconnected from the simulation."},
"outgoingConnectionRequests":function(d){return "Изходящи заявки"},
"_of_":function(d){return " на "},
"packet":function(d){return "Пакет"},
"packetInfo":function(d){return "Пакет информация"},
"pickASection":function(d){return "Изберете раздел"},
"readWire":function(d){return "чете връзката"},
"receiveBits":function(d){return "Получаване на битове"},
"receivedMessageLog":function(d){return "Регистър на получените съобщения"},
"removePacket":function(d){return "Премахване на пакет"},
"router":function(d){return "Маршрутизатор"},
"routerStatus":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+".  Room for "+appLocale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+appLocale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "Честотна лента"},
"routerTab_memory":function(d){return "Памет"},
"routerTab_stats":function(d){return "Статистика"},
"routerX":function(d){return "Рутер "+appLocale.v(d,"x")},
"send":function(d){return "Изпрати"},
"sendAMessage":function(d){return "Изпращане на съобщение"},
"sendBits":function(d){return "Изпращане на битове"},
"sentBitsLog":function(d){return "Изпраща Bits Log"},
"sentMessageLog":function(d){return "Изпратено в регистър на съобщения"},
"setName":function(d){return "Задайте име"},
"setWire":function(d){return "Задай връзка"},
"setWireToValue":function(d){return "Задаване връзка, за да "+appLocale.v(d,"value")},
"shareThisNetwork":function(d){return "Споделяне на тази мрежа"},
"size":function(d){return "Размер"},
"status":function(d){return "Състояние"},
"to":function(d){return "Към"},
"unknownNode":function(d){return "Unknown Node"},
"unlimited":function(d){return "Неограничен"},
"waitingForNodeToConnect":function(d){return "В очакване на "+appLocale.v(d,"node")+" да се свърже..."},
"workspaceHeader":function(d){return "Интернет симулатор"},
"xOfYPackets":function(d){return appLocale.v(d,"x")+" на "+appLocale.v(d,"y")},
"xSecondPerPulse":function(d){return appLocale.v(d,"x")+" секунда за инпулс"},
"xSecondsPerPulse":function(d){return appLocale.v(d,"x")+" секунди за инпулс"},
"x_Gbps":function(d){return appLocale.v(d,"x")+"Gbps"},
"x_Mbps":function(d){return appLocale.v(d,"x")+"Mbps"},
"x_Kbps":function(d){return appLocale.v(d,"x")+"Kbps"},
"x_bps":function(d){return appLocale.v(d,"x")+"bps"},
"x_GBytes":function(d){return appLocale.v(d,"x")+"GB"},
"x_MBytes":function(d){return appLocale.v(d,"x")+"MB"},
"x_KBytes":function(d){return appLocale.v(d,"x")+"KB"},
"x_Bytes":function(d){return appLocale.v(d,"x")+"B"},
"x_bits":function(d){return appLocale.v(d,"x")+"b"}};