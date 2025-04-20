import status from "http-status";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(status.BAD_REQUEST).json({ message: "Invalid input" });
	}

	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(status.NOT_FOUND).json({ message: "User not found" });
		}

		let isPasswordValid = await bcrypt.compare(password, user.password);

		if (isPasswordValid) {
			let token = crypto.randomBytes(20).toString("hex");
			user.token = token;
			await user.save();
			return res.status(status.OK).json({ token: token });
		} else {
			return res
				.status(status.UNAUTHORIZED)
				.json({ message: "Invalid Username or password" });
		}
	} catch (e) {
		res
			.status(status.INTERNAL_SERVER_ERROR)
			.json({ message: `Something went wrong ${e}` });
	}
};

const register = async (req, res) => {
	const { name, username, password } = req.body;

	try {
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(status.FOUND).json({ message: "User already exists" });
		}

		const hashedPassword = await hash(password, 10);

		const newUser = new User({
			name: name,
			username: username,
			password: hashedPassword,
		});

		await newUser.save();
		return res
			.status(status.CREATED)
			.json({ message: "User created successfully" });
	} catch (e) {
		res
			.status(status.INTERNAL_SERVER_ERROR)
			.json({ message: "Something went wrong" });
	}
};

const getUserHistory = async (req, res) => {
	const { token } = req.query;

	try {
		const user = await User.findOne({ token: token });

		const meetings = await Meeting.find({ user_id: user.username });

		res.json(meetings);
	} catch (e) {
		console.error(`Error getting user history: ${e}`);
		res.json({ message: `Something went wrong ${e}` });
	}
};

const addToHistory = async (req, res) => {
	const { token, meeting_code } = req.body;
	try {
		const user = await User.findOne({ token: token });

		const newMeeting = new Meeting({
			user_id: user.username,
			meeting_id: meeting_code,
		});

		await newMeeting.save();
		res.status(status.CREATED).json({ message: "Meeting added to history" });
	} catch (e) {
		res.json({ message: `Something went wrong ${e}` });
	}
};

export { login, register, addToHistory, getUserHistory };
