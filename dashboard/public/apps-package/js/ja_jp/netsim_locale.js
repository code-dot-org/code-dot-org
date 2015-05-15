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
"addPacket":function(d){return "パケットを追加"},
"addRouter":function(d){return "Add Router"},
"appendCountToTitle":function(d){return netsim_locale.v(d,"title")+" ("+netsim_locale.v(d,"count")+")"},
"ascii":function(d){return "アスキーコード"},
"autoDnsUsageMessage":function(d){return "自動DNSノード\n使用方法：GET ホスト名 [ホスト名 [ホスト名 ...]]"},
"binary":function(d){return "Binary"},
"bitCounter":function(d){return netsim_locale.v(d,"x")+"/"+netsim_locale.v(d,"y")+" ビット"},
"bits":function(d){return "ビット"},
"buttonAccept":function(d){return "Accept"},
"buttonCancel":function(d){return "キャンセル"},
"buttonJoin":function(d){return "Join"},
"clear":function(d){return "クリア"},
"collapse":function(d){return "Collapse"},
"connect":function(d){return "Connect"},
"connected":function(d){return "接続済"},
"connectedToNodeName":function(d){return "Connected to "+netsim_locale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Connecting to "+netsim_locale.v(d,"nodeName")},
"connectToANode":function(d){return "Connect to a Node"},
"connectToAPeer":function(d){return "Connect to a Peer"},
"connectToARouter":function(d){return "Connect to a Router"},
"decimal":function(d){return "10 進数"},
"disconnected":function(d){return "切断"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "DNSモード"},
"dnsMode_AUTOMATIC":function(d){return "自動"},
"dnsMode_MANUAL":function(d){return "手動"},
"dnsMode_NONE":function(d){return "設定なし"},
"dropdownPickOne":function(d){return "-- PICK ONE --"},
"encoding":function(d){return "エンコーディング"},
"expand":function(d){return "Expand"},
"from":function(d){return "差出人"},
"hex":function(d){return "16 進数"},
"hexadecimal":function(d){return "16 進数"},
"incomingConnectionRequests":function(d){return "Incoming connection requests"},
"infinity":function(d){return "無限\n"},
"instructions":function(d){return "やり方:"},
"joinSection":function(d){return "Join Section"},
"lobby":function(d){return "Lobby"},
"lobbyInstructionsForPeers":function(d){return "Find your partner in the list to the right and click the 'Join' button next to their name to create an outgoing connection request."},
"lobbyInstructionsForRouters":function(d){return "Click the 'Join' button next to any router to be added to the router. Create a new router to join by clicking the 'Add Router' button."},
"lobbyInstructionsGeneral":function(d){return "Connect with a router or a peer to begin using the simulator."},
"lobbyIsEmpty":function(d){return "Nobody's here yet."},
"lobbyStatusWaitingForOther":function(d){return netsim_locale.v(d,"spinner")+" Waiting for "+netsim_locale.v(d,"otherName")+" to connect... ("+netsim_locale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Waiting for you..."},
"logStatus_dropped":function(d){return "Dropped"},
"logStatus_success":function(d){return "Success"},
"markAsRead":function(d){return "Mark as read"},
"message":function(d){return "メッセージ"},
"myDevice":function(d){return "私のデバイス"},
"myName":function(d){return "My Name"},
"myPrivateNetwork":function(d){return "My Private Network"},
"mySection":function(d){return "My Section"},
"number":function(d){return "Number"},
"numBitsPerPacket":function(d){return "1 パケットあたり "+netsim_locale.v(d,"x")+" ビット"},
"numBitsPerChunk":function(d){return netsim_locale.v(d,"numBits")+" bits per chunk"},
"notConnected":function(d){return "Not connected"},
"onBeforeUnloadWarning":function(d){return "You will be disconnected from the simulation."},
"outgoingConnectionRequests":function(d){return "Outgoing connection requests"},
"_of_":function(d){return " の "},
"packet":function(d){return "パケット"},
"packetInfo":function(d){return "パケット情報"},
"pickASection":function(d){return "Pick a Section"},
"readWire":function(d){return "Read Wire"},
"receiveBits":function(d){return "Receive Bits"},
"receivedMessageLog":function(d){return "メッセージログを受信"},
"removePacket":function(d){return "パケットを削除"},
"router":function(d){return "ルーター"},
"routerStatus":function(d){return "Connected to "+netsim_locale.v(d,"connectedClients")+".  Room for "+netsim_locale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+netsim_locale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+netsim_locale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "Bandwidth"},
"routerTab_memory":function(d){return "Memory"},
"routerTab_stats":function(d){return "Stats"},
"routerX":function(d){return "ルーター "+netsim_locale.v(d,"x")},
"send":function(d){return "送信"},
"sendAMessage":function(d){return "メッセージを送信"},
"sendBits":function(d){return "Send Bits"},
"sentBitsLog":function(d){return "Sent Bits Log"},
"sentMessageLog":function(d){return "メッセージログを送信"},
"setName":function(d){return "Set Name"},
"setWire":function(d){return "Set Wire"},
"setWireToValue":function(d){return "Set Wire to "+netsim_locale.v(d,"value")},
"shareThisNetwork":function(d){return "Share this network"},
"size":function(d){return "Size"},
"status":function(d){return "Status"},
"to":function(d){return "宛先"},
"unknownNode":function(d){return "Unknown Node"},
"unlimited":function(d){return "無制限"},
"waitingForNodeToConnect":function(d){return "Waiting for "+netsim_locale.v(d,"node")+" to connect..."},
"workspaceHeader":function(d){return "Internet Simulator"},
"xOfYPackets":function(d){return netsim_locale.v(d,"y")+" の "+netsim_locale.v(d,"x")},
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