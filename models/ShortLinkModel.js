import mongoose from "mongoose";

// Monthly clicks schema
const monthlyClicksSchema = new mongoose.Schema({
  month: { type: String, required: true }, // e.g., "Jan", "Feb", ...
  clicks: { type: Number, default: 0 },
});

const shortLinkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    longUrl: { type: String, required: true },

    shortCode: { type: String, required: true, unique: true },

    title: { type: String },

    clicks: { type: Number, default: 0 },

    lastClickedAt: { type: Date },

    // ⭐ Add this field for frontend graphs
    monthlyClicks: {
      type: [monthlyClicksSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShortLink", shortLinkSchema);
