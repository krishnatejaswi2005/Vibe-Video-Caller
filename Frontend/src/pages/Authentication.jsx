import * as React from "react";
import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	Paper,
	Box,
	Grid,
	Typography,
	Snackbar,
	useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../contexts/AuthContext";

const defaultTheme = createTheme();

export default function Authentication() {
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [name, setName] = React.useState("");
	const [error, setError] = React.useState(null);
	const [message, setMessage] = React.useState("");
	const [formState, setFormState] = React.useState(0);
	const [open, setOpen] = React.useState(false);

	const { handleRegister, handleLogin } = React.useContext(AuthContext);
	const isMobile = useMediaQuery("(max-width:768px)");

	const handleAuth = async () => {
		try {
			if (formState === 0) {
				let result = await handleRegister(name, username, password);
				setMessage(result);
				setOpen(true);
				setError(null);
				setPassword("");
				setUsername("");
				setFormState(1);
			} else {
				let result = await handleLogin(username, password);
				setMessage(result);
				setOpen(true);
				setError(null);
				setPassword("");
				setUsername("");
			}
		} catch (error) {
			setError(error?.response?.data?.message || "An error occurred.");
			if (error?.response?.status === 302) {
				setMessage("User already exists, please login");
				setOpen(true);
				setPassword("");
				setUsername("");
				setFormState(1);
			}
		}
	};

	return (
		<ThemeProvider theme={defaultTheme}>
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					minHeight: "100vh",
				}}
			>
				{/* IMAGE SECTION */}
				<Box
					sx={{
						flex: 1,
						height: { xs: "250px", md: "100vh" },
						backgroundImage: "url(https://picsum.photos/2000/1000)",
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				/>

				{/* FORM SECTION */}
				<Box
					component={Paper}
					elevation={6}
					sx={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						py: { xs: 4, md: 0 },
						px: { xs: 3, md: 6 },
					}}
				>
					<Box
						sx={{
							width: "100%",
							maxWidth: 400,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
							<LockOutlinedIcon />
						</Avatar>

						<Box sx={{ display: "flex", gap: 2, mb: 2, width: "100%" }}>
							<Button
								variant={formState === 0 ? "contained" : "outlined"}
								fullWidth
								onClick={() => setFormState(0)}
							>
								SIGN UP
							</Button>
							<Button
								variant={formState === 1 ? "contained" : "outlined"}
								fullWidth
								onClick={() => setFormState(1)}
							>
								SIGN IN
							</Button>
						</Box>

						<Box component="form" noValidate sx={{ mt: 1, width: "100%" }}>
							{formState === 0 && (
								<TextField
									margin="normal"
									required
									fullWidth
									id="fullname"
									label="Full Name"
									name="fullname"
									value={name}
									autoFocus
									onChange={(e) => setName(e.target.value)}
								/>
							)}

							<TextField
								margin="normal"
								required
								fullWidth
								id="username"
								label="Username"
								name="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								name="password"
								label="Password"
								type="password"
								value={password}
								id="password"
								onChange={(e) => setPassword(e.target.value)}
							/>

							{error && (
								<Typography variant="body2" color="error" align="center">
									{error}
								</Typography>
							)}

							<Button
								type="button"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
								onClick={handleAuth}
							>
								{formState === 0 ? "SIGN UP" : "SIGN IN"}
							</Button>
						</Box>
					</Box>
				</Box>
			</Box>
			<Snackbar open={open} autoHideDuration={4000} message={message} />
		</ThemeProvider>
	);
}
