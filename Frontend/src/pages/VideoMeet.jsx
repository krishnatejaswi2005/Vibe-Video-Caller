import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "../styles/VideoMeet.css";
import { io } from "socket.io-client";

import "../styles/VideoMeet.css";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import SpeakerNotesOffIcon from "@mui/icons-material/SpeakerNotesOff";
import { Badge, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import server from "../environment";
const server_url = server;

var connections = {};

const peerConfigConnections = {
	iceServers: [
		{
			urls: "stun:stun.l.google.com:19302",
		},
	],
};

export default function VideoMeet() {
	var socketRef = useRef();
	let socketIdRef = useRef();

	let localVideoRef = useRef();

	let pendingCandidates = {};

	let [videoAvailable, setVideoAvailable] = useState(true);

	let [audioAvailable, setAudioAvailable] = useState(true);

	let [video, setVideo] = useState();

	let [audio, setAudio] = useState();

	let [screen, setScreen] = useState(false);

	let [showModal, setShowModal] = useState(false);

	let [screenAvailable, setScreenAvailable] = useState(true);

	let [messages, setMessages] = useState([]);

	let [message, setMessage] = useState("");

	let [newMessages, setNewMessages] = useState(0);

	let [askForUsername, setAskForUsername] = useState(true);

	let [username, setUsername] = useState("");

	const videoRef = useRef([]);

	let [videos, setVideos] = useState([]);

	let [connectionError, setConnectionError] = useState(null);

	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(
			navigator.userAgent
		);
		setIsMobile(checkMobile);
	}, []);

	const getPermissions = async () => {
		try {
			const videoPermissions = await navigator.mediaDevices.getUserMedia({
				video: true,
			});

			if (videoPermissions) {
				setVideoAvailable(true);
			} else {
				setVideoAvailable(false);
			}
			const audioPermissions = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});

			if (audioPermissions) {
				setAudioAvailable(true);
			} else {
				setAudioAvailable(false);
			}

			if (videoAvailable || audioAvailable) {
				const userMediaStream = await navigator.mediaDevices.getUserMedia({
					video: videoAvailable,
					audio: audioAvailable,
				});

				if (userMediaStream) {
					window.localStream = userMediaStream;
					if (localVideoRef.current) {
						localVideoRef.current.srcObject = userMediaStream;
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		getPermissions();
	}, []);

	let getUserMediaSuccess = (stream) => {
		try {
			if (window.localStream) {
				window.localStream.getTracks().forEach((track) => track.stop());
			}
		} catch (error) {
			console.log(error);
		}

		window.localStream = stream;
		localVideoRef.current.srcObject = stream;

		for (let id in connections) {
			if (id === socketIdRef.current) continue;
			window.localStream.getTracks().forEach((track) => {
				connections[id].addTrack(track, window.localStream); // ✅
			});

			connections[id].createOffer().then((description) => {
				connections[id]
					.setLocalDescription(description)
					.then(() => {
						socketRef.current.emit(
							"signal",
							id,
							JSON.stringify({ sdp: connections[id].localDescription })
						);
					})
					.catch((e) => {
						console.log(e);
					});
			});
		}

		stream.getTracks().forEach(
			(track) =>
				(track.onended = () => {
					setVideo(false);
					setAudio(false);

					try {
						let tracks = localVideoRef.current.srcObject.getTracks();
						tracks.forEach((track) => {
							track.stop();
						});
					} catch (e) {
						console.log(e);
					}

					let blackSilence = (...args) =>
						new MediaStream([black(...args), silence()]);
					window.localStream = blackSilence();
					localVideoRef.current.srcObject = window.localStream;

					for (let id in connections) {
						window.localStream.getTracks().forEach((track) => {
							connections[id].addTrack(track, window.localStream); // ✅
						});

						connections[id].createOffer().then((description) => {
							connections[id]
								.setLocalDescription(description)
								.then(() => {
									socketRef.current.emit(
										"signal",
										id,
										JSON.stringify({ sdp: connections[id].localDescription })
									);
								})
								.catch((e) => {
									console.log(e);
								});
						});
					}
				})
		);
	};

	let silence = () => {
		let ctx = new AudioContext();
		let oscillator = ctx.createOscillator();

		let dst = oscillator.connect(ctx.createMediaStreamDestination());

		oscillator.start();
		ctx.resume();
		return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
	};

	let black = ({ width = 640, height = 480 } = {}) => {
		let canvas = Object.assign(document.createElement("canvas"), {
			width,
			height,
		});

		canvas.getContext("2d").fillRect(0, 0, width, height);

		let stream = canvas.captureStream();
		return Object.assign(stream.getVideoTracks()[0], { enabled: false });
	};

	let getUserMedia = async () => {
		if ((video && videoAvailable) || (audio && audioAvailable)) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: video,
					audio: audio,
				});

				getUserMediaSuccess(stream); // will set window.localStream and assign to video

				// Optional: force video to play
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream;
					localVideoRef.current.onloadedmetadata = () => {
						localVideoRef.current
							.play()
							.catch((err) => console.error("Error playing local video:", err));
					};
				}
			} catch (e) {
				console.error("getUserMedia error:", e);
			}
		} else {
			try {
				if (localVideoRef.current && localVideoRef.current.srcObject) {
					let tracks = localVideoRef.current.srcObject.getTracks();
					tracks.forEach((track) => track.stop());
				}
			} catch (e) {
				console.error("Error stopping tracks:", e);
			}
		}
	};

	useEffect(() => {
		if (video !== undefined && audio !== undefined) {
			getUserMedia();
		}
	}, [audio, video]);

	function reorderSDPMediaLines(sdp) {
		const lines = sdp.split("\r\n");
		const mLines = lines.filter((line) => line.startsWith("m="));
		const videoLine = mLines.find((line) => line.startsWith("m=video"));
		const audioLine = mLines.find((line) => line.startsWith("m=audio"));

		// Ensure video before audio
		if (
			audioLine &&
			videoLine &&
			sdp.indexOf(audioLine) < sdp.indexOf(videoLine)
		) {
			// Swap order
			const audioIndex = lines.indexOf(audioLine);
			const videoIndex = lines.indexOf(videoLine);
			[lines[audioIndex], lines[videoIndex]] = [
				lines[videoIndex],
				lines[audioIndex],
			];
		}
		return lines.join("\r\n");
	}

	let gotMessageFromServer = (fromId, message) => {
		var signal = JSON.parse(message);

		try {
			if (fromId !== socketIdRef.current) {
				const peer = connections[fromId];

				if (signal.sdp) {
					const desc = new RTCSessionDescription(signal.sdp);
					// const orderedSdp = reorderSDPMediaLines(desc.sdp);
					// desc.sdp = orderedSdp;

					// Handle unexpected state
					if (desc.type === "offer" && peer.signalingState !== "stable") {
						console.warn(
							`Skipping offer from ${fromId} due to signaling state: ${peer.signalingState}`
						);
						return;
					}

					peer
						.setRemoteDescription(desc)
						.then(() => {
							if (desc.type === "offer") {
								return peer.createAnswer().then((answer) => {
									return peer.setLocalDescription(answer).then(() => {
										if (socketRef.current && socketRef.current.emit) {
											socketRef.current.emit(
												"signal",
												fromId,
												JSON.stringify({ sdp: peer.localDescription })
											);
										}
									});
								});
							}
						})
						.then(() => {
							// Flush pending ICE candidates after setting remote description
							if (pendingCandidates[fromId]) {
								pendingCandidates[fromId].forEach((ice) => {
									peer
										.addIceCandidate(new RTCIceCandidate(ice))
										.catch((e) =>
											console.error("Error adding pending ICE:", e)
										);
								});
								delete pendingCandidates[fromId];
							}
						})
						.catch((e) => {
							console.error(
								"Error setting remote description or answering:",
								e
							);
						});
				}

				if (signal.ice) {
					if (peer.remoteDescription && peer.remoteDescription.type) {
						peer
							.addIceCandidate(new RTCIceCandidate(signal.ice))
							.catch((e) => console.error("Error adding ICE candidate:", e));
					} else {
						// Buffer ICE candidates if remoteDescription isn't set
						if (!pendingCandidates[fromId]) {
							pendingCandidates[fromId] = [];
						}
						pendingCandidates[fromId].push(signal.ice);
					}
				}
			}
		} catch (error) {
			console.error("Error parsing message:", error);
		}
	};

	let addMessage = (data, sender, socketIdSender) => {
		setMessages((prevMessages) => [
			...prevMessages,
			{
				sender: sender,
				data: data,
			},
		]);
		if (socketIdSender !== socketIdRef.current) {
			setNewMessages((prevMessages) => prevMessages + 1);
		}
	};

	let connectToSocketServer = () => {
		// Clean up any existing socket connection
		if (socketRef.current) {
			socketRef.current.disconnect();
		}

		try {
			socketRef.current = io(server_url, {
				transports: ["websocket", "polling"],
				upgrade: true,
				rememberUpgrade: true,
				cors: {
					origin: "*",
					methods: ["GET", "POST"],
				},
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				timeout: 20000,
				forceNew: true,
			});

			socketRef.current.on("connect_error", (error) => {
				console.error("Socket connection error:", error);
				setConnectionError(`Failed to connect to server: ${error.message}`);
			});

			socketRef.current.on("connect", () => {
				setConnectionError(null);
				socketIdRef.current = socketRef.current.id;

				const currentPath = window.location.href;
				socketRef.current.emit("join-call", currentPath);
			});

			socketRef.current.on("user-joined", (id, clients) => {
				if (clients.length === 0) {
					// Clear the messages state
					setMessages([]);
				}

				// First, add all existing clients to the videos array
				setVideos((prevVideos) => {
					const newVideos = [...prevVideos];

					clients.forEach((clientId) => {
						if (
							clientId !== socketIdRef.current &&
							!newVideos.find((v) => v.socketId === clientId)
						) {
							newVideos.push({
								socketId: clientId,
								stream: null,
								autoPlay: true,
								playsinline: true,
							});
						}
					});

					return newVideos;
				});

				// Then set up connections for all clients
				clients.forEach((socketListId) => {
					if (
						socketListId !== socketIdRef.current &&
						!connections[socketListId]
					) {
						connections[socketListId] = new RTCPeerConnection(
							peerConfigConnections
						);

						connections[socketListId].onicecandidate = (event) => {
							if (event.candidate) {
								socketRef.current.emit(
									"signal",
									socketListId,
									JSON.stringify({ ice: event.candidate })
								);
							}
						};

						connections[socketListId].ontrack = (event) => {
							setVideos((prevVideos) => {
								const videoExists = prevVideos.find(
									(v) => v.socketId === socketListId
								);
								if (videoExists) {
									return prevVideos.map((v) =>
										v.socketId === socketListId
											? { ...v, stream: event.streams[0] }
											: v
									);
								}
								return [
									...prevVideos,
									{
										socketId: socketListId,
										stream: event.streams[0],
										autoPlay: true,
										playsinline: true,
									},
								];
							});
						};

						// Add local tracks to the connection
						if (window.localStream) {
							window.localStream.getTracks().forEach((track) => {
								connections[socketListId].addTrack(track, window.localStream);
							});
						}
					}
				});

				// Create offers for new connections if we're the new user
				if (id === socketIdRef.current) {
					clients.forEach((clientId) => {
						if (clientId !== socketIdRef.current && connections[clientId]) {
							connections[clientId]
								.createOffer()
								.then((description) => {
									return connections[clientId].setLocalDescription(description);
								})
								.then(() => {
									socketRef.current.emit(
										"signal",
										clientId,
										JSON.stringify({
											sdp: connections[clientId].localDescription,
										})
									);
								})
								.catch((e) =>
									console.error(`Error creating offer for ${clientId}:`, e)
								);
						}
					});
				}
			});

			socketRef.current.on("user-ended-call", (userId) => {
				// Remove remote video for user who ended the call
				setVideos(videos.filter((video) => video.socketId !== userId));
			});

			socketRef.current.on("user-left", (id) => {
				if (Object.keys(connections).length === 0) {
					setMessages(null);
				}

				// Clean up the connection
				if (connections[id]) {
					connections[id].close();
					delete connections[id];
				}

				// Remove from videos array
				setVideos((prevVideos) => {
					return prevVideos.filter((video) => video.socketId !== id);
				});
			});

			socketRef.current.on("signal", (fromId, message) => {
				gotMessageFromServer(fromId, message);
			});

			socketRef.current.on("chat-message", addMessage);
			socketRef.current.on("disconnect", () => {});
		} catch (error) {
			console.error("Error initializing socket connection:", error);
			setConnectionError(`Failed to initialize connection: ${error.message}`);
		}
	};

	let getMedia = () => {
		setVideo(videoAvailable);
		setAudio(audioAvailable);
		connectToSocketServer();
	};

	let routeTo = useNavigate();

	let connect = () => {
		setAskForUsername(false);
		getMedia();
	};

	let getDisplayMediaSuccess = (stream) => {
		try {
			// Stop existing tracks
			if (window.localStream) {
				window.localStream.getTracks().forEach((track) => track.stop());
			}

			// Update local video element
			window.localStream = stream;
			if (localVideoRef.current) {
				localVideoRef.current.srcObject = stream;
			}

			// Update all peer connections
			for (let id in connections) {
				if (id === socketIdRef.current) continue;

				// Remove existing tracks
				const senders = connections[id].getSenders();
				senders.forEach((sender) => {
					if (sender.track) {
						connections[id].removeTrack(sender);
					}
				});

				// Add new screen sharing tracks
				stream.getTracks().forEach((track) => {
					connections[id].addTrack(track, stream);
				});

				// Create and send new offer
				connections[id]
					.createOffer()
					.then((description) => {
						return connections[id].setLocalDescription(description);
					})
					.then(() => {
						socketRef.current.emit(
							"signal",
							id,
							JSON.stringify({ sdp: connections[id].localDescription })
						);
					})
					.catch((e) => {
						console.error("Error in screen sharing offer:", e);
					});
			}

			// Handle screen sharing stop
			stream.getTracks().forEach((track) => {
				track.onended = () => {
					setScreen(false);
					stopScreenSharing();
				};
			});
		} catch (error) {
			console.error("Error in screen sharing:", error);
			setScreen(false);
		}
	};

	let stopScreenSharing = () => {
		try {
			// Stop screen sharing tracks
			if (window.localStream) {
				window.localStream.getTracks().forEach((track) => track.stop());
			}

			// Restore camera stream
			navigator.mediaDevices
				.getUserMedia({
					video: videoAvailable,
					audio: audioAvailable,
				})
				.then((stream) => {
					window.localStream = stream;
					if (localVideoRef.current) {
						localVideoRef.current.srcObject = stream;
					}

					// Update all peer connections with camera stream
					for (let id in connections) {
						if (id === socketIdRef.current) continue;

						// Remove existing tracks
						const senders = connections[id].getSenders();
						senders.forEach((sender) => {
							if (sender.track) {
								connections[id].removeTrack(sender);
							}
						});

						// Add camera tracks
						stream.getTracks().forEach((track) => {
							connections[id].addTrack(track, stream);
						});

						// Create and send new offer
						connections[id]
							.createOffer()
							.then((description) => {
								return connections[id].setLocalDescription(description);
							})
							.then(() => {
								if (socketRef.current && socketRef.current.emit) {
									socketRef.current.emit(
										"signal",
										id,
										JSON.stringify({ sdp: connections[id].localDescription })
									);
								}
							})
							.catch((e) => {
								console.error("Error in camera stream offer:", e);
							});
					}
				})
				.catch((error) => {
					console.error("Error restoring camera stream:", error);
				});
		} catch (error) {
			console.error("Error stopping screen share:", error);
		}
	};

	let getDisplayMedia = () => {
		if (screen) {
			if (navigator.mediaDevices.getDisplayMedia) {
				navigator.mediaDevices
					.getDisplayMedia({
						video: true,
						audio: true,
					})
					.then(getDisplayMediaSuccess)
					.catch((error) => {
						console.error("Error getting display media:", error);
						setScreen(false);
					});
			}
		} else {
			stopScreenSharing();
		}
	};

	useEffect(() => {
		if (screen !== undefined) {
			getDisplayMedia();
		}
	}, [screen]);

	let sendMessage = () => {
		// addMessage(message, username, socketIdRef.current);
		socketRef.current.emit("chat-message", message, username);
		setMessage("");
	};

	let handleEndCall = () => {
		try {
			let tracks = localVideoRef.current.srcObject.getTracks();
			tracks.forEach((track) => {
				track.stop();
			});
		} catch (error) {
			console.log(error);
		}

		// Send signal to other users that you are ending the call
		socketRef.current.emit("user-ended-call", socketIdRef.current);

		routeTo("/home");
	};

	useEffect(() => {
		if (socketIdRef.current && connections[socketIdRef.current].length === 0) {
			setMessages(null);
		}
	}, [connections, socketIdRef]);

	useEffect(() => {
		if (showModal) {
			setNewMessages(0);
		}
	}, [showModal]);

	return (
		<div>
			{connectionError && (
				<div style={{ color: "red", margin: "10px 0", textAlign: "center" }}>
					{connectionError}
				</div>
			)}
			{askForUsername ? (
				<div className="lobby-container">
					<div className="lobby-card">
						<h2 className="lobby-title">Enter the Lobby</h2>
						<TextField
							id="username-input"
							label="Username"
							variant="outlined"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							fullWidth
							className="lobby-input"
						/>
						<Button
							variant="contained"
							color="primary"
							onClick={connect}
							disabled={!!connectionError}
							className="lobby-button"
						>
							Connect
						</Button>

						<div className="lobby-video-wrapper">
							<video
								ref={localVideoRef}
								autoPlay
								playsInline
								muted
								className="lobby-video"
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="video-container">
					{/* Chat Modal */}
					{showModal && (
						<div className="chat-container">
							<div className="chat-header">
								<h2>Chat</h2>
							</div>
							<div className="chat-messages">
								{messages.length > 0 ? (
									messages.map((item, index) => (
										<div key={index} style={{ marginBottom: "10px" }}>
											<p style={{ fontWeight: "bold" }}>{item.sender}</p>
											<p>{item.data}</p>
										</div>
									))
								) : (
									<p style={{ fontWeight: "bold" }}>No messages yet</p>
								)}
							</div>
							<div className="chat-input-container">
								<TextField
									id="chat-input"
									label="Enter your message"
									variant="outlined"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									fullWidth
								/>
								<Button variant="contained" onClick={sendMessage}>
									Send
								</Button>
							</div>
						</div>
					)}

					{/* Local Video */}
					<video
						ref={localVideoRef}
						autoPlay
						playsInline
						muted
						className={`local-video ${
							showModal ? "local-video-left" : "local-video-right"
						}`}
					/>

					{/* Remote Videos */}
					<div className="remote-video-container">
						{videos
							.filter(
								(video) =>
									video.stream && video.stream.getVideoTracks().length > 0
							)
							.map((video, index) => (
								<div key={video.socketId}>
									<video
										ref={(el) => {
											if (el && video.stream) {
												el.srcObject = video.stream;
												el.onloadedmetadata = () => {
													el.play().catch((e) => {
														console.error("Error playing video:", e);
													});
												};
											}
										}}
										className="remote-video"
										autoPlay
										playsInline
									/>
								</div>
							))}
					</div>

					{/* Video Control Buttons */}
					<div className="video-buttons">
						<IconButton onClick={() => setVideo(!video)}>
							{video ? <VideocamIcon /> : <VideocamOffIcon />}
						</IconButton>
						<IconButton onClick={handleEndCall} style={{ color: "red" }}>
							<CallEndIcon />
						</IconButton>
						<IconButton onClick={() => setAudio(!audio)}>
							{audio ? <MicIcon /> : <MicOffIcon />}
						</IconButton>

						{!isMobile && screenAvailable ? (
							<IconButton onClick={() => setScreen(!screen)}>
								{screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
							</IconButton>
						) : (
							<></>
						)}

						<Badge badgeContent={newMessages} max={99} color="secondary">
							<IconButton onClick={() => setShowModal(!showModal)}>
								{showModal ? <SpeakerNotesOffIcon /> : <ChatIcon />}
							</IconButton>
						</Badge>
					</div>
				</div>
			)}
		</div>
	);
}
