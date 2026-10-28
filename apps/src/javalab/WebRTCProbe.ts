type ConnectionResult = {
  peerId: string;
  success: boolean;
  via: 'direct' | 'STUN' | 'TURN' | 'unknown';
};

const classroomId = 'example_classroom_id';
const stunTurnConfig: RTCConfiguration = {
  iceServers: [
    {urls: 'stun:34.235.169.123:3478'},
    {
      urls: 'turn:34.235.169.123:3478',
      username: 'anyonecanlearntocode',
      credential: 'fR39zk9948zveov45',
    },
  ],
};

const peers: Record<string, RTCPeerConnection> = {}; // To track peer connections
const results: ConnectionResult[] = [];

/**
 * Establish WebRTC connections to peers in the same classroom.
 */
async function connectToPeers(peerIds: string[], myId: string): Promise<void> {
  for (const peerId of peerIds) {
    if (peerId === myId) continue; // Skip self-connection

    const pc = new RTCPeerConnection(stunTurnConfig);
    peers[peerId] = pc;

    // Create a DataChannel for communication
    const dataChannel = pc.createDataChannel('probe');
    dataChannel.onopen = () => {
      console.log(`Connection open with ${peerId}`);
      dataChannel.send('helloworld');
    };

    dataChannel.onmessage = event => {
      console.log(`Received message from ${peerId}: ${event.data}`);
    };

    // Handle ICE candidates
    pc.onicecandidate = event => {
      if (event.candidate) {
        sendSignalingMessage(peerId, {candidate: event.candidate});
      }
    };

    // Detect connection state changes
    pc.onconnectionstatechange = async () => {
      if (pc.connectionState === 'connected') {
        const connectionType = await detectConnectionType(pc);
        results.push({peerId, success: true, via: connectionType});
        console.log(`Connection to ${peerId} succeeded via ${connectionType}`);
      } else if (pc.connectionState === 'failed') {
        results.push({peerId, success: false, via: 'unknown'});
        console.log(`Connection to ${peerId} failed`);
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignalingMessage(peerId, {offer});

    // Handle incoming signaling messages
    receiveSignalingMessage(message => {
      if (message.answer) {
        pc.setRemoteDescription(new RTCSessionDescription(message.answer));
      } else if (message.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    });
  }
}

/**
 * Detect the connection type (direct, STUN, TURN).
 */
async function detectConnectionType(
  pc: RTCPeerConnection
): Promise<'direct' | 'STUN' | 'TURN' | 'unknown'> {
  const stats = await pc.getStats();
  for (const report of stats.values()) {
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      const localCandidate = stats.get(report.localCandidateId);
      const remoteCandidate = stats.get(report.remoteCandidateId);

      if (localCandidate && remoteCandidate) {
        if (remoteCandidate.candidateType === 'relay') return 'TURN';
        if (remoteCandidate.candidateType === 'srflx') return 'STUN';
        if (remoteCandidate.candidateType === 'host') return 'direct';
      }
    }
  }
  return 'unknown';
}

/**
 * Simulated function to send signaling messages to peers.
 */
function sendSignalingMessage(peerId: string, message: object): void {
  console.log(`Send signaling to ${peerId}`, message);
  // Implement WebSocket or AJAX to send signaling messages to peers
}

/**
 * Simulated function to receive signaling messages from peers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function receiveSignalingMessage(callback: (message: any) => void): void {
  // Implement WebSocket or long polling to receive signaling messages
  // Example: callback({ answer: ... }) or callback({ candidate: ... })
}

/**
 * Run the WebRTC probe experiment.
 */
async function runProbe(): Promise<void> {
  const myId = 'example_student_id'; // Replace with the actual student ID
  const peerIds = await fetchPeerIds(classroomId); // Fetch the list of peer IDs dynamically

  await connectToPeers(peerIds, myId);

  // Wait for connections to stabilize
  setTimeout(() => {
    console.log('Results:', results);
    sendResultsToServer(results); // Send the JSON log object to the server
  }, 30000); // Allow 30 seconds for all connections
}

/**
 * Simulated function to fetch peer IDs.
 */
async function fetchPeerIds(classroomId: string): Promise<string[]> {
  // Replace with an API call to fetch peers in the same classroom
  return ['student1', 'student2', 'student3'];
}

/**
 * Simulated function to send results to the server.
 */
function sendResultsToServer(results: ConnectionResult[]): void {
  console.log('Sending results to server:', results);
  // Implement an API call to send results back to your server
}

runProbe();
