import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeet from "./pages/VideoMeet";
import Home from "./pages/Home";
import History from "./pages/History";

function App() {
	return (
		<>
			<div className="App">
				<Router>
					<AuthProvider>
						<Routes>
							<Route path="/" element={<LandingPage />} />
							<Route path="/home" element={<Home />} />

							<Route path="/auth" element={<Authentication />} />
							<Route path="/history" element={<History />} />
							<Route path="/:url" element={<VideoMeet />} />
						</Routes>
					</AuthProvider>
				</Router>
			</div>
		</>
	);
}

export default App;
