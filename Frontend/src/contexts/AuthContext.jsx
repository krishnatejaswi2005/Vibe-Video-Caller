import axios from "axios";
import status from "http-status";

import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
	baseURL: "http://localhost:3000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
	const authContext = useContext(AuthContext);

	const [userData, setUserData] = useState(authContext);

	const router = useNavigate();

	const handleLogin = async (username, password) => {
		try {
			const request = await client.post("/login", {
				username: username,
				password: password,
			});

			if (request.status === status.OK) {
				localStorage.setItem("token", request.data.token);
				router("/home");
			}
		} catch (error) {
			throw error;
		}
	};

	const handleRegister = async (name, username, password) => {
		try {
			const request = await client.post("/register", {
				name: name,
				username: username,
				password: password,
			});

			if (request.status === status.CREATED) {
				return request.data.message;
			}
		} catch (error) {
			throw error;
		}
	};

	const getHistoryOfUser = async () => {
		try {
			let request = await client.get("/get_all_activity", {
				params: {
					token: localStorage.getItem("token"),
				},
			});
			return request.data;
		} catch (error) {
			console.error("Error getting history of user: ", error);
			throw error;
		}
	};

	const addToUserHistory = async (meetingCode) => {
		try {
			let request = await client.post("/add_to_activity", {
				token: localStorage.getItem("token"),
				meeting_code: meetingCode,
			});
			return request;
		} catch (error) {
			throw error;
		}
	};

	const data = {
		userData,
		setUserData,
		getHistoryOfUser,
		addToUserHistory,
		handleRegister,
		handleLogin,
	};
	return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
