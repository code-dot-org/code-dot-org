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
"addPacket":function(d){return "הוסף מנה"},
"addRouter":function(d){return "הוסף נתב"},
"appendCountToTitle":function(d){return appLocale.v(d,"title")+" ("+appLocale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "צומת DNS אוטומטית\nשימוש: GET hostname [hostname [hostname ...]]"},
"binary":function(d){return "Binary"},
"bitCounter":function(d){return "ביטים "+appLocale.v(d,"x")+"/"+appLocale.v(d,"y")},
"bits":function(d){return "ביטים"},
"buttonAccept":function(d){return "Accept"},
"buttonCancel":function(d){return "בטל"},
"buttonJoin":function(d){return "Join"},
"clear":function(d){return "נקה"},
"collapse":function(d){return "קפל"},
"connect":function(d){return "חבר"},
"connected":function(d){return "מחובר"},
"connectedToNodeName":function(d){return "Connected to "+appLocale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Connecting to "+appLocale.v(d,"nodeName")},
"connectToANode":function(d){return "התחבר לצומת"},
"connectToAPeer":function(d){return "Connect to a Peer"},
"connectToARouter":function(d){return "Connect to a Router"},
"decimal":function(d){return "עשרוני"},
"disconnected":function(d){return "מנותק"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "מצב DNS"},
"dnsMode_AUTOMATIC":function(d){return "אוטומטי"},
"dnsMode_MANUAL":function(d){return "ידני"},
"dnsMode_NONE":function(d){return "ללא"},
"dropdownPickOne":function(d){return "--בחר אחד--"},
"encoding":function(d){return "קידוד"},
"expand":function(d){return "הרחב"},
"from":function(d){return "מ"},
"hex":function(d){return "בבסיס 16"},
"hexadecimal":function(d){return "בבסיס 16"},
"incomingConnectionRequests":function(d){return "בקשות חיבור נכנסות"},
"infinity":function(d){return "אינסוף"},
"instructions":function(d){return "Instructions"},
"joinSection":function(d){return "צרף סעיף"},
"lobby":function(d){return "מבואה"},
"lobbyInstructionsForPeers":function(d){return "Find your partner in the list to the right and click the 'Join' button next to their name to create an outgoing connection request."},
"lobbyInstructionsForRouters":function(d){return "Click the 'Join' button next to any router to be added to the router. Create a new router to join by clicking the 'Add Router' button."},
"lobbyInstructionsGeneral":function(d){return "Connect with a router or a peer to begin using the simulator."},
"lobbyIsEmpty":function(d){return "איש טרם הגיע."},
"lobbyStatusWaitingForOther":function(d){return appLocale.v(d,"spinner")+" Waiting for "+appLocale.v(d,"otherName")+" to connect... ("+appLocale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Waiting for you..."},
"logStatus_dropped":function(d){return "נפל"},
"logStatus_success":function(d){return "הצלחה"},
"markAsRead":function(d){return "סמן כנקרא"},
"message":function(d){return "הודעה"},
"myDevice":function(d){return "ההתקן שלי"},
"myName":function(d){return "שמי"},
"myPrivateNetwork":function(d){return "הרשת הפרטית שלי"},
"mySection":function(d){return "החלק שלי"},
"number":function(d){return "מספר"},
"numBitsPerPacket":function(d){return appLocale.v(d,"x")+" ביטים למנה"},
"numBitsPerChunk":function(d){return appLocale.v(d,"numBits")+" ביטים למנה"},
"notConnected":function(d){return "Not connected"},
"onBeforeUnloadWarning":function(d){return "You will be disconnected from the simulation."},
"outgoingConnectionRequests":function(d){return "בקשות חיבור יוצא"},
"_of_":function(d){return " של "},
"packet":function(d){return "מנה"},
"packetInfo":function(d){return "מידע על החבילה"},
"pickASection":function(d){return "בחר חלק"},
"readWire":function(d){return "קרא מחוט"},
"receiveBits":function(d){return "קבל ביטים"},
"receivedMessageLog":function(d){return "יומן הודעות נכנסות"},
"removePacket":function(d){return "הסר חבילה"},
"router":function(d){return "נתב"},
"routerStatus":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+".  Room for "+appLocale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+appLocale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "רוחב פס"},
"routerTab_memory":function(d){return "זכרון"},
"routerTab_stats":function(d){return "נתונים סטטיסטים"},
"routerX":function(d){return "נתב "+appLocale.v(d,"x")},
"send":function(d){return "שלח"},
"sendAMessage":function(d){return "שלח הודעה"},
"sendBits":function(d){return "שלח ביטים"},
"sentBitsLog":function(d){return "יומן ביטים שנשלחו"},
"sentMessageLog":function(d){return "יומן הודעות שנשלחו"},
"setName":function(d){return "קבע שם"},
"setWire":function(d){return "קבע חוט"},
"setWireToValue":function(d){return "קבע חוט ל"+appLocale.v(d,"value")},
"shareThisNetwork":function(d){return "שתף רשת זו"},
"size":function(d){return "גודל"},
"status":function(d){return "מצב"},
"to":function(d){return "אל"},
"unknownNode":function(d){return "Unknown Node"},
"unlimited":function(d){return "בלתי מוגבל"},
"waitingForNodeToConnect":function(d){return "ממתין ש "+appLocale.v(d,"node")+" יתחבר..."},
"workspaceHeader":function(d){return "Internet Simulator"},
"xOfYPackets":function(d){return appLocale.v(d,"x")+" מתוך "+appLocale.v(d,"y")},
"xSecondPerPulse":function(d){return appLocale.v(d,"x")+" שניה לפעימה"},
"xSecondsPerPulse":function(d){return appLocale.v(d,"x")+" שניות לפעימה"},
"x_Gbps":function(d){return appLocale.v(d,"x")+"Gbps"},
"x_Mbps":function(d){return appLocale.v(d,"x")+"Mbps"},
"x_Kbps":function(d){return appLocale.v(d,"x")+"Kbps"},
"x_bps":function(d){return appLocale.v(d,"x")+"bps"},
"x_GBytes":function(d){return appLocale.v(d,"x")+"GB"},
"x_MBytes":function(d){return appLocale.v(d,"x")+"MB"},
"x_KBytes":function(d){return appLocale.v(d,"x")+"KB"},
"x_Bytes":function(d){return appLocale.v(d,"x")+"B"},
"x_bits":function(d){return appLocale.v(d,"x")+"b"}};