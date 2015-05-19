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
v:function(d,k){netsim_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){netsim_locale.c(d,k);return d[k] in p?p[d[k]]:(k=netsim_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){netsim_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).netsim_locale = {
"a_and_b":function(d){return "A/B"},
"addPacket":function(d){return "Додати пакет"},
"addRouter":function(d){return "Додати роутер"},
"appendCountToTitle":function(d){return netsim_locale.v(d,"title")+" ("+netsim_locale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "Автоматичний DNS вузол\nВикористовування: GET hostname [hostname [hostname ...]]"},
"binary":function(d){return "Двійкова система"},
"bitCounter":function(d){return netsim_locale.v(d,"x")+"/"+netsim_locale.v(d,"y")+" біт"},
"bits":function(d){return "Біти"},
"buttonAccept":function(d){return "Прийняти"},
"buttonCancel":function(d){return "Скасувати"},
"buttonJoin":function(d){return "Приєднатися"},
"clear":function(d){return "Очистити"},
"collapse":function(d){return "Згорнути"},
"connect":function(d){return "З'єднатися"},
"connected":function(d){return "З'єднано"},
"connectedToNodeName":function(d){return "З'єднано з "+netsim_locale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Підключення до "+netsim_locale.v(d,"nodeName")},
"connectToANode":function(d){return "Підключення до вузла"},
"connectToAPeer":function(d){return "Підключення до Peer"},
"connectToARouter":function(d){return "З'єднатися з роутером"},
"decimal":function(d){return "Десятковий"},
"defaultNodeName":function(d){return "[New Node]"},
"disconnected":function(d){return "Роз'єднано"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "Режим DNS"},
"dnsMode_AUTOMATIC":function(d){return "Автоматично"},
"dnsMode_MANUAL":function(d){return "Вручну"},
"dnsMode_NONE":function(d){return "Відсутній"},
"dropdownPickOne":function(d){return "-- ВИБЕРІТЬ ОДИН --"},
"encoding":function(d){return "Кодування"},
"expand":function(d){return "Розгорнути"},
"from":function(d){return "З"},
"hex":function(d){return "Hex"},
"hexadecimal":function(d){return "Шістнадцятковий"},
"incomingConnectionRequests":function(d){return "Вхідні запити на підключення"},
"infinity":function(d){return "Нескінченність"},
"instructions":function(d){return "Інструкції"},
"joinSection":function(d){return "Приєднати розділ"},
"lobby":function(d){return "Лоббі"},
"lobbyInstructionsForPeers":function(d){return "Знайдіть вашогопартнера в списку справа і натисніть кнопку «Реєстрація» поруч з їх ім'ям, щоб створити запит вихідного з'єднання."},
"lobbyInstructionsForRouters":function(d){return "Натисніть кнопку \"Реєстрація\" поруч з будь-яким маршрутизатором аби бути доданим до маршрутизатора. Створіть новий маршрутизатор, щоб приєднатися, натиснувши на кнопку \"Додати маршрутизатор\"."},
"lobbyInstructionsGeneral":function(d){return "З'єднатися з маршрутизатором або піром, щоб почати використовувати симулятор."},
"lobbyIsEmpty":function(d){return "Поки тут нікого нема."},
"lobbyStatusWaitingForOther":function(d){return netsim_locale.v(d,"spinner")+" Чекає на "+netsim_locale.v(d,"otherName")+" щоб підключити... ("+netsim_locale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Чекаю тебе ..."},
"logStatus_dropped":function(d){return "Відключений"},
"logStatus_success":function(d){return "Успішно"},
"markAsRead":function(d){return "Відмітити як прочитане"},
"message":function(d){return "Повідомлення"},
"myDevice":function(d){return "Мій пристрій"},
"myName":function(d){return "Моє ім'я"},
"myPrivateNetwork":function(d){return "Моя приватна мережа"},
"mySection":function(d){return "Мій розділ"},
"number":function(d){return "Номер"},
"numBitsPerPacket":function(d){return netsim_locale.v(d,"x")+" біт на пакет"},
"numBitsPerChunk":function(d){return netsim_locale.v(d,"numBits")+" біт на фрагмент"},
"notConnected":function(d){return "Немає підключення"},
"onBeforeUnloadWarning":function(d){return "Ви будете відключені від симуляцій."},
"outgoingConnectionRequests":function(d){return "Вихідні запити на підключення"},
"_of_":function(d){return " з "},
"packet":function(d){return "Пакет"},
"packetInfo":function(d){return "Информация про пакет"},
"pickASection":function(d){return "Pick a Section"},
"readWire":function(d){return "Read Wire"},
"receiveBits":function(d){return "Отримувати біти"},
"receivedMessageLog":function(d){return "Отримане повідомлення журналу"},
"removePacket":function(d){return "Видалити пакет"},
"router":function(d){return "Маршрутизатор"},
"routerStatus":function(d){return "Connected to "+netsim_locale.v(d,"connectedClients")+".  Room for "+netsim_locale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+netsim_locale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+netsim_locale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "Пропускна можливість"},
"routerTab_memory":function(d){return "Память"},
"routerTab_stats":function(d){return "Статистика"},
"routerX":function(d){return "Маршрутизатор "+netsim_locale.v(d,"x")},
"send":function(d){return "Надіслати"},
"sendAMessage":function(d){return "Надіслати повідомлення"},
"sendBits":function(d){return "Відправити біти"},
"sentBitsLog":function(d){return "Sent Bits Log"},
"sentMessageLog":function(d){return "Sent Message Log"},
"setName":function(d){return "Set Name"},
"setWire":function(d){return "Set Wire"},
"setWireToValue":function(d){return "Set Wire to "+netsim_locale.v(d,"value")},
"shareThisNetwork":function(d){return "Поділитися цією мережею"},
"size":function(d){return "Розмір"},
"status":function(d){return "Статус"},
"to":function(d){return "Кому"},
"unknownNode":function(d){return "Невідомий вузол"},
"unlimited":function(d){return "Необмежено"},
"waitingForNodeToConnect":function(d){return "Waiting for "+netsim_locale.v(d,"node")+" to connect..."},
"workspaceHeader":function(d){return "Інтернет симулятор"},
"xOfYPackets":function(d){return netsim_locale.v(d,"x")+" від "+netsim_locale.v(d,"y")},
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