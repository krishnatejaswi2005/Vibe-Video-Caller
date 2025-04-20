import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardContent,
	IconButton,
	Typography,
	Grid,
	Box,
	Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

export default function History() {
	const { getHistoryOfUser } = useContext(AuthContext);
	const [meetings, setMeetings] = useState([]);
	const routeTo = useNavigate();

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const history = await getHistoryOfUser();
				setMeetings(history);
			} catch (error) {
				console.error("Error fetching user history:", error);
			}
		};
		fetchHistory();
	}, []);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	return (
		<Box
			sx={{
				padding: { xs: "16px", md: "32px" },
				maxWidth: "900px",
				margin: "0 auto",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: "24px",
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 600 }}>
					Meeting History
				</Typography>
				<Button
					variant="outlined"
					startIcon={<HomeIcon />}
					onClick={() => routeTo(`/home`)}
					sx={{
						textTransform: "none",
						fontWeight: 500,
						borderColor: "#1976d2",
						color: "#1976d2",
						"&:hover": {
							backgroundColor: "#e3f2fd",
							borderColor: "#1976d2",
						},
					}}
				>
					Go to Home
				</Button>
			</Box>

			{meetings.length > 0 ? (
				<Grid container spacing={2}>
					{meetings.map((e, i) => (
						<Grid item xs={12} sm={6} md={4} key={i}>
							<Card
								variant="outlined"
								sx={{
									borderRadius: "16px",
									boxShadow: 2,
									transition: "transform 0.2s ease-in-out",
									"&:hover": { transform: "scale(1.02)" },
								}}
							>
								<CardContent>
									<Typography
										sx={{ fontWeight: 600, fontSize: "1rem", mb: 1 }}
										color="primary"
									>
										Room Code: {e.meeting_id}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Date: {formatDate(e.date)}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			) : (
				<Typography
					variant="h6"
					sx={{
						textAlign: "center",
						color: "text.secondary",
						marginTop: "48px",
					}}
				>
					No meeting history found.
				</Typography>
			)}
		</Box>
	);
}
