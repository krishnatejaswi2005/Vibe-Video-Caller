import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import Button from "@mui/material/Button";
import { AuthContext } from "../contexts/AuthContext";

function Home() {
	let navigate = useNavigate();
	const [meetingCode, setMeetingCode] = useState("");
	const { addToUserHistory } = useContext(AuthContext);
	let handleJoinVideoCall = async () => {
		await addToUserHistory(meetingCode);
		navigate(`/${meetingCode}`);
	};

	return (
		<>
			<div className="navBar">
				<div style={{ display: "flex", alignItems: "center" }}>
					<h3>Vibe Video Caller</h3>
				</div>
				<div style={{ display: "flex", alignItems: "center" }}>
					<IconButton onClick={() => navigate("/history")}>
						<RestoreIcon />
						<p>History</p>
					</IconButton>
					<Button
						onClick={() => {
							localStorage.removeItem("token");
							navigate("/auth");
						}}
						style={{ marginLeft: "10px" }}
					>
						Logout
					</Button>
				</div>
			</div>
			<div className="meetContainer">
				<div className="leftPanel">
					<h3 style={{ textAlign: "center", margin: "0.7rem" }}>
						Join a Meeting
					</h3>
					<div className="joinMeetingContainer">
						<TextField
							fullWidth
							label="Enter Room Code"
							variant="outlined"
							value={meetingCode}
							onChange={(e) => setMeetingCode(e.target.value)}
							sx={{ maxWidth: 400 }}
						/>
						<Button
							onClick={handleJoinVideoCall}
							variant="contained"
							sx={{
								height: "3rem",
								width: "6rem",
								mt: { xs: 1, sm: 0 },
								backgroundColor: "#1976d2",
								"&:hover": { backgroundColor: "#125aa3" },
							}}
						>
							Join
						</Button>
					</div>
				</div>
				<div className="rightPanel">
					<img src="\videoLogo.png" alt="logo" />
				</div>
			</div>
		</>
	);
}

export default withAuth(Home);
