import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
	user_id: { type: String, ref: "User" },
	meeting_id: { type: String, required: true },
	date: { type: Date, default: Date.now, required: true },
});

const Meeting = mongoose.model("Meeting", meetingSchema);
export { Meeting };
