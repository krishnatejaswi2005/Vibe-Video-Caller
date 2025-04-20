import React, { useState } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

function LandingPage() {
	const router = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleNavigate = (path) => {
		setMenuOpen(false); // Close menu on navigation
		router(path);
	};

	return (
		<div className="LandingPage">
			<div className="navbar">
				<div className="logo">
					<h2>Vibe Video Caller</h2>
				</div>

				<div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
					<div className="bar"></div>
					<div className="bar"></div>
					<div className="bar"></div>
				</div>

				<div className={`nav-links ${menuOpen ? "open" : ""}`}>
					<p onClick={() => handleNavigate("/ut76ftv")}>Join as Guest</p>
					<p onClick={() => handleNavigate("/auth")}>Register</p>
					<p onClick={() => handleNavigate("/auth")} role="button">
						Login
					</p>
				</div>
			</div>

			<div className="LandingPageBody">
				<div className="taglines">
					<p
						className="tagline"
						style={{ fontSize: "2.5rem", fontWeight: "bold" }}
					>
						<span style={{ color: "#f99944" }}>Connect</span> with your loved
						Ones
					</p>
					<p>Cover a distance by Vibe Video Caller</p>
					<Link to={"/auth"}>
						<p role="button" className="button">
							Get Started
						</p>
					</Link>
				</div>
				<div className="mobiles">
					<img src="/mobile.png" alt="mobile" />
				</div>
			</div>
		</div>
	);
}

export default LandingPage;
