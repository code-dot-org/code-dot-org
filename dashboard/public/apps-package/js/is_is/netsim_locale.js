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
"addPacket":function(d){return "Bæta við pakka"},
"addRouter":function(d){return "Nýr beinir"},
"appendCountToTitle":function(d){return netsim_locale.v(d,"title")+" ("+netsim_locale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "Sjálfvirkur DNS hnútur\nNotkun: GET netheiti [netheiti [netheiti ...]]"},
"binary":function(d){return "Tvíundir"},
"bitCounter":function(d){return netsim_locale.v(d,"x")+"/"+netsim_locale.v(d,"y")+" bitar"},
"bits":function(d){return "Bitar"},
"buttonAccept":function(d){return "Samþykkja"},
"buttonCancel":function(d){return "Hætta við"},
"buttonJoin":function(d){return "Tengjast"},
"clear":function(d){return "Hreinsa"},
"collapse":function(d){return "Fella"},
"connect":function(d){return "Tengja"},
"connected":function(d){return "Tengt"},
"connectedToNodeName":function(d){return "Tenging við "+netsim_locale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Tengist "+netsim_locale.v(d,"nodeName")},
"connectToANode":function(d){return "Tengjast hnút"},
"connectToAPeer":function(d){return "Tengjast jafningja"},
"connectToARouter":function(d){return "Tengjast beini (router)"},
"decimal":function(d){return "Í tugakerfi"},
"defaultNodeName":function(d){return "[New Node]"},
"disconnected":function(d){return "Ótengt"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "DNS skipan"},
"dnsMode_AUTOMATIC":function(d){return "Sjálfvirk"},
"dnsMode_MANUAL":function(d){return "Handvirk"},
"dnsMode_NONE":function(d){return "Engin"},
"dropdownPickOne":function(d){return "-- VELDU EITT --"},
"encoding":function(d){return "Umkóðun"},
"expand":function(d){return "Opna"},
"from":function(d){return "Frá"},
"hex":function(d){return "Hex"},
"hexadecimal":function(d){return "Í sextándakerfi"},
"incomingConnectionRequests":function(d){return "Innsendar tengingabeiðnir"},
"infinity":function(d){return "Óendanleiki"},
"instructions":function(d){return "Leiðbeiningar"},
"joinSection":function(d){return "Tengjast hópi"},
"lobby":function(d){return "Anddyri"},
"lobbyInstructionsForPeers":function(d){return "Finndu félaga þinn í listanum til hægri og smelltu á hnappinn \"Tengjast\" við nafn hans til að búa til útsenda beiðni um tengingu."},
"lobbyInstructionsForRouters":function(d){return "Smelltu á hnappinn \"Tengjast\" við einhvern beini til að bæta þér við beininn. Búðu til nýjan beini til að tengjast með því að smella á \"Nýr beinir\" hnappinn."},
"lobbyInstructionsGeneral":function(d){return "Tengstu beini eða jafningja til að byrja að nota herminn."},
"lobbyIsEmpty":function(d){return "Hér er enginn ennþá."},
"lobbyStatusWaitingForOther":function(d){return netsim_locale.v(d,"spinner")+" Bíð þess að "+netsim_locale.v(d,"otherName")+" tengist... ("+netsim_locale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Beðið eftir þér..."},
"logStatus_dropped":function(d){return "Týndist"},
"logStatus_success":function(d){return "Tókst"},
"markAsRead":function(d){return "Merkja sem lesið"},
"message":function(d){return "Skilaboð"},
"myDevice":function(d){return "Tækið mitt"},
"myName":function(d){return "Nafn mitt"},
"myPrivateNetwork":function(d){return "Einkanetkerfi mitt"},
"mySection":function(d){return "Hópur minn"},
"number":function(d){return "Númer"},
"numBitsPerPacket":function(d){return netsim_locale.v(d,"x")+" bitar í pakka"},
"numBitsPerChunk":function(d){return netsim_locale.v(d,"numBits")+" bitar í hverjum bút"},
"notConnected":function(d){return "Engin tenging"},
"onBeforeUnloadWarning":function(d){return "Tengingunni við herminn verður slitið."},
"outgoingConnectionRequests":function(d){return "Útsendar tengingabeiðnir"},
"_of_":function(d){return " af "},
"packet":function(d){return "Pakki"},
"packetInfo":function(d){return "Pakkaupplýsingar"},
"pickASection":function(d){return "Velja hóp"},
"readWire":function(d){return "Lesa af vír"},
"receiveBits":function(d){return "Taka við bitum"},
"receivedMessageLog":function(d){return "Skrá yfir móttekin skilaboð"},
"removePacket":function(d){return "Fjarlægja pakka"},
"router":function(d){return "Beinir"},
"routerStatus":function(d){return "Tenging við "+netsim_locale.v(d,"connectedClients")+".  Pláss fyrir "+netsim_locale.v(d,"remainingSpace")+" í viðbót."},
"routerStatusFull":function(d){return "Tenging við "+netsim_locale.v(d,"connectedClients")+". Ekki meira pláss."},
"routerStatusNoConnections":function(d){return "Enginn tengdur enn.  Pláss fyrir allt að "+netsim_locale.v(d,"maximumClients")+" tengingar."},
"routerTab_bandwidth":function(d){return "Bandbreidd"},
"routerTab_memory":function(d){return "Minni"},
"routerTab_stats":function(d){return "Tölfræði"},
"routerX":function(d){return "Beinir "+netsim_locale.v(d,"x")},
"send":function(d){return "Senda"},
"sendAMessage":function(d){return "Senda skilaboð"},
"sendBits":function(d){return "Senda bita"},
"sentBitsLog":function(d){return "Skrá yfir senda bita"},
"sentMessageLog":function(d){return "Skrá yfir send skilaboð"},
"setName":function(d){return "Stilla heiti"},
"setWire":function(d){return "Stilla vír"},
"setWireToValue":function(d){return "Stilla vír á "+netsim_locale.v(d,"value")},
"shareThisNetwork":function(d){return "Deila þessu neti"},
"size":function(d){return "Stærð"},
"status":function(d){return "Staða"},
"to":function(d){return "Til"},
"unknownNode":function(d){return "Óþekktur hnútur"},
"unlimited":function(d){return "Ótakmarkað"},
"waitingForNodeToConnect":function(d){return "Bíð eftir að "+netsim_locale.v(d,"node")+" tengist..."},
"workspaceHeader":function(d){return "Internet hermir"},
"xOfYPackets":function(d){return netsim_locale.v(d,"x")+" af "+netsim_locale.v(d,"y")},
"xSecondPerPulse":function(d){return netsim_locale.v(d,"x")+" sekúnda á púls"},
"xSecondsPerPulse":function(d){return netsim_locale.v(d,"x")+" sekúndur á púls"},
"x_Gbps":function(d){return netsim_locale.v(d,"x")+"Gbps"},
"x_Mbps":function(d){return netsim_locale.v(d,"x")+"Mbps"},
"x_Kbps":function(d){return netsim_locale.v(d,"x")+"Kbps"},
"x_bps":function(d){return netsim_locale.v(d,"x")+"bps"},
"x_GBytes":function(d){return netsim_locale.v(d,"x")+"GB"},
"x_MBytes":function(d){return netsim_locale.v(d,"x")+"MB"},
"x_KBytes":function(d){return netsim_locale.v(d,"x")+"KB"},
"x_Bytes":function(d){return netsim_locale.v(d,"x")+"B"},
"x_bits":function(d){return netsim_locale.v(d,"x")+"b"}};