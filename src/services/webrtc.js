const configuration = {
  iceServers: [
    { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
  }

  async getUserMedia() {
    const constraints = {
      video: {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        facingMode: 'user'
      },
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(configuration);
    return this.peerConnection;
  }

  addLocalStream() {
    if (this.localStream && this.peerConnection) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
  }

  async createOffer() {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription({
      type: 'offer',
      sdp: offer.sdp
    }));

    const answer = await this.peerConnection.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: answer.sdp
    }));
  }

  async addIceCandidate(candidateData) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const candidate = new RTCIceCandidate({
      candidate: candidateData.candidate,
      sdpMid: candidateData.sdpMid,
      sdpMLineIndex: candidateData.sdpMLineIndex,
    });
    
    await this.peerConnection.addIceCandidate(candidate);
  }

  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
  }
}

export default WebRTCService;
