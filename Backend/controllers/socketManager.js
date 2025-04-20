import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
		pingTimeout: 60000,
		transports: ["websocket", "polling"],
	});

	io.on("connection", (socket) => {
		socket.on("join-call", (path) => {
			// Clean up any existing connections for this socket (in case of reconnect)
			for (let roomPath in connections) {
				const index = connections[roomPath]?.indexOf(socket.id);
				if (index !== -1) {
					connections[roomPath].splice(index, 1);
					if (connections[roomPath].length === 0) {
						delete connections[roomPath];
					}
				}
			}

			if (!connections[path]) {
				connections[path] = [];
			}

			connections[path].push(socket.id);
			timeOnline[socket.id] = new Date();

			// Join the socket to the room
			socket.join(path);

			// Emit to all users in the room including the new user
			io.to(path).emit("user-joined", socket.id, connections[path]);

			if (messages[path] != undefined) {
				messages[path].forEach((msg) => {
					socket.emit(
						"chat-message",
						msg.data,
						msg.sender,
						msg["socket-id-sender"]
					);
				});
			}
		});

		socket.on("signal", (toId, message) => {
			io.to(toId).emit("signal", socket.id, message);
		});

		socket.on("chat-message", (data, sender) => {
			const roomPath = Object.keys(connections).find((path) =>
				connections[path].includes(socket.id)
			);

			if (roomPath) {
				if (connections[roomPath].length === 0) {
					// Clear the messages array if there are no users in the room
					messages[roomPath] = [];
				} else {
					if (!messages[roomPath]) {
						messages[roomPath] = [];
					}

					const messageData = {
						sender: sender,
						data: data,
						"socket-id-sender": socket.id,
					};

					messages[roomPath].push(messageData);

					io.to(roomPath).emit("chat-message", data, sender, socket.id);
				}
			}
		});
		socket.on("user-ended-call", (userId) => {
			io.emit("user-ended-call", userId);
		});
		socket.on("disconnect", () => {
			for (let roomPath in connections) {
				const index = connections[roomPath]?.indexOf(socket.id);
				if (index !== -1) {
					// Notify others in the room
					io.to(roomPath).emit("user-left", socket.id);

					connections[roomPath].splice(index, 1);
					if (connections[roomPath].length === 0) {
						delete connections[roomPath];
					}
				}
			}
			delete timeOnline[socket.id];
		});
	});

	return io;
};
