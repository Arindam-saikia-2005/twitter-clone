const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
	{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["follow", "like"],//For specifiic values the notification will sound
		},
		read: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Notification = mongoose.model("mongoose",notificationSchema)

module.exports = Notification