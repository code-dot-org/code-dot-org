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
"addPacket":function(d){return "Tambah paket"},
"addRouter":function(d){return "Tambahkan Router"},
"appendCountToTitle":function(d){return appLocale.v(d,"title")+" ("+appLocale.v(d,"count")+")"},
"ascii":function(d){return "ASCII"},
"autoDnsUsageMessage":function(d){return "DNS Node Otomatis\nPenggunaan: GET hostname [hostname [hostname ...]]"},
"binary":function(d){return "Biner"},
"bitCounter":function(d){return appLocale.v(d,"x")+"/"+appLocale.v(d,"y")+" bits"},
"bits":function(d){return "Bit"},
"buttonAccept":function(d){return "Accept"},
"buttonCancel":function(d){return "Batal"},
"buttonJoin":function(d){return "Join"},
"clear":function(d){return "Hapus"},
"collapse":function(d){return "Ciutkan"},
"connect":function(d){return "Sambungkan"},
"connected":function(d){return "Tersambung"},
"connectedToNodeName":function(d){return "Connected to "+appLocale.v(d,"nodeName")},
"connectingToNodeName":function(d){return "Connecting to "+appLocale.v(d,"nodeName")},
"connectToANode":function(d){return "Terhubung ke sebuah Node"},
"connectToAPeer":function(d){return "Connect to a Peer"},
"connectToARouter":function(d){return "Connect to a Router"},
"decimal":function(d){return "Desimal"},
"disconnected":function(d){return "Terputus"},
"dns":function(d){return "DNS"},
"dnsMode":function(d){return "Mode DNS"},
"dnsMode_AUTOMATIC":function(d){return "Otomatis"},
"dnsMode_MANUAL":function(d){return "Manual"},
"dnsMode_NONE":function(d){return "Tidak Ada"},
"dropdownPickOne":function(d){return "--PILIH SALAH SATU--"},
"encoding":function(d){return "Pengkodean"},
"expand":function(d){return "Memperluas"},
"from":function(d){return "dari"},
"hex":function(d){return "Hex"},
"hexadecimal":function(d){return "Heksadesimal"},
"incomingConnectionRequests":function(d){return "Permintaan sambungan"},
"infinity":function(d){return "∞"},
"instructions":function(d){return "instruksi"},
"joinSection":function(d){return "Gabung Bagian"},
"lobby":function(d){return "Lobby"},
"lobbyInstructionsForPeers":function(d){return "Find your partner in the list to the right and click the 'Join' button next to their name to create an outgoing connection request."},
"lobbyInstructionsForRouters":function(d){return "Click the 'Join' button next to any router to be added to the router. Create a new router to join by clicking the 'Add Router' button."},
"lobbyInstructionsGeneral":function(d){return "Connect with a router or a peer to begin using the simulator."},
"lobbyIsEmpty":function(d){return "Tak seorang pun di sini lagi."},
"lobbyStatusWaitingForOther":function(d){return appLocale.v(d,"spinner")+" Waiting for "+appLocale.v(d,"otherName")+" to connect... ("+appLocale.v(d,"otherStatus")+")"},
"lobbyStatusWaitingForYou":function(d){return "Waiting for you..."},
"logStatus_dropped":function(d){return "menepatkan"},
"logStatus_success":function(d){return "Sukses"},
"markAsRead":function(d){return "Tandai sebagai telah dibaca"},
"message":function(d){return "Pesan"},
"myDevice":function(d){return "Perangkat saya"},
"myName":function(d){return "Nama saya"},
"myPrivateNetwork":function(d){return "Jaringan pribadi saya"},
"mySection":function(d){return "Bagian saya"},
"number":function(d){return "Nomor"},
"numBitsPerPacket":function(d){return appLocale.v(d,"x")+" bit per paket"},
"numBitsPerChunk":function(d){return appLocale.v(d,"numBits")+" bit per potong"},
"notConnected":function(d){return "Not connected"},
"onBeforeUnloadWarning":function(d){return "You will be disconnected from the simulation."},
"outgoingConnectionRequests":function(d){return "Permintaan sambungan keluar"},
"_of_":function(d){return " dari "},
"packet":function(d){return "Paket"},
"packetInfo":function(d){return "Informasi paket"},
"pickASection":function(d){return "Pilih Bagian"},
"readWire":function(d){return "Baca Kabel"},
"receiveBits":function(d){return "Menerima bit"},
"receivedMessageLog":function(d){return "Catatat pesan yang diterima"},
"removePacket":function(d){return "Hapus paket"},
"router":function(d){return "Router"},
"routerStatus":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+".  Room for "+appLocale.v(d,"remainingSpace")+" more."},
"routerStatusFull":function(d){return "Connected to "+appLocale.v(d,"connectedClients")+". No more room."},
"routerStatusNoConnections":function(d){return "Nobody connected yet.  Connect up to "+appLocale.v(d,"maximumClients")+" people."},
"routerTab_bandwidth":function(d){return "Bandwidth"},
"routerTab_memory":function(d){return "Memori"},
"routerTab_stats":function(d){return "Statistik"},
"routerX":function(d){return "Router"+appLocale.v(d,"x")},
"send":function(d){return "Kirim"},
"sendAMessage":function(d){return "Kirim pesan"},
"sendBits":function(d){return "Kirim Bits"},
"sentBitsLog":function(d){return "Kirim Bits Masuk"},
"sentMessageLog":function(d){return "Kirim catatan pesan"},
"setName":function(d){return "Tetapkan Nama"},
"setWire":function(d){return "Tetapkan Kabel"},
"setWireToValue":function(d){return "Tetapkan Kabel Hingga "+appLocale.v(d,"value")},
"shareThisNetwork":function(d){return "Berbagi jaringan ini"},
"size":function(d){return "Ukuran"},
"status":function(d){return "Status"},
"to":function(d){return "Untuk"},
"unknownNode":function(d){return "Unknown Node"},
"unlimited":function(d){return "Tak terbatas"},
"waitingForNodeToConnect":function(d){return "Menunggu "+appLocale.v(d,"node")+" untuk menghubungkan..."},
"workspaceHeader":function(d){return "Simulator Internet"},
"xOfYPackets":function(d){return appLocale.v(d,"x")+" dari "+appLocale.v(d,"y")},
"xSecondPerPulse":function(d){return appLocale.v(d,"x")+" detik per pulsa"},
"xSecondsPerPulse":function(d){return appLocale.v(d,"x")+" detik per pulsa"},
"x_Gbps":function(d){return appLocale.v(d,"x")+"Gbps"},
"x_Mbps":function(d){return appLocale.v(d,"x")+"Mbps"},
"x_Kbps":function(d){return appLocale.v(d,"x")+"Kbps"},
"x_bps":function(d){return appLocale.v(d,"x")+"bps"},
"x_GBytes":function(d){return appLocale.v(d,"x")+"GB"},
"x_MBytes":function(d){return appLocale.v(d,"x")+"MB"},
"x_KBytes":function(d){return appLocale.v(d,"x")+"KB"},
"x_Bytes":function(d){return appLocale.v(d,"x")+"B"},
"x_bits":function(d){return appLocale.v(d,"x")+"b"}};