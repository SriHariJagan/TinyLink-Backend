import ShortLink from "../models/ShortLinkModel.js";
import crypto from "crypto";

// Helper: generate unique short code
const generateShortCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = crypto.randomBytes(3).toString("hex"); // 6 chars
    const existing = await ShortLink.findOne({ shortCode: code });
    if (!existing) exists = false;
  }
  return code;
};

// ----------------------
// CREATE SHORT URL
// ----------------------
export const createShortURL = async (req, res) => {
  try {
    const { longUrl, shortCode, title } = req.body;
    const userId = req.user.id;

    let finalCode = shortCode;

    // If shortCode is sent from frontend, validate uniqueness
    if (shortCode) {
      const exists = await ShortLink.findOne({ shortCode });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Short code already in use"
        });
      }
    }

    // If no shortCode sent → generate new unique code
    if (!shortCode) {
      finalCode = await generateShortCode();
    }

    const link = new ShortLink({
      user: userId,
      longUrl,
      shortCode: finalCode,
      title,
    });

    await link.save();

    res.status(201).json({
      success: true,
      message: "Short link created",
      link,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ----------------------
// UPDATE SHORT URL
// ----------------------
export const updateShortURL = async (req, res) => {
  try {
    const { id } = req.params;
    const { longUrl, shortCode, title } = req.body;
    const userId = req.user.id;

    const link = await ShortLink.findOne({ _id: id, user: userId });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found or unauthorized",
      });
    }

    // Check shortcode uniqueness ONLY if user changed it
    if (shortCode && shortCode !== link.shortCode) {
      const exists = await ShortLink.findOne({ shortCode });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Short code already in use",
        });
      }
    }

    // Update fields
    link.longUrl = longUrl ?? link.longUrl;
    link.shortCode = shortCode ?? link.shortCode;
    link.title = title ?? link.title;

    await link.save();

    res.json({
      success: true,
      message: "Short link updated successfully",
      link,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ----------------------
// DELETE SHORT URL
// ----------------------
export const deleteShortURL = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const link = await ShortLink.findOneAndDelete({ _id: id, user: userId });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Short link deleted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ----------------------
// GET USER LINKS (FIXED FORMAT)
// ----------------------
export const getUserLinks = async (req, res) => {
  try {
    const userId = req.user.id;

    const links = await ShortLink.find({ user: userId }).sort({ createdAt: -1 });

    // Format date cleanly
    const formatDate = (date) => {
      if (!date) return "Never";
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Convert DB links → frontend format
    const mapped = links.map(link => ({
      id: link._id,
      title: link.title || "Untitled",
      short: `${req.protocol}://${req.headers.host}/${link.shortCode}`,
      long: link.longUrl,
      clicks: link.clicks,
      lastClicked: link.lastClickedAt ? formatDate(link.lastClickedAt) : "Never",
      rawLastClicked: link.lastClickedAt || null, // used for sorting activity
    }));

    // ---------- Calculate Stats ----------

    // Total links
    const totalLinks = mapped.length;

    // Total clicks
    const totalClicks = mapped.reduce((sum, item) => sum + item.clicks, 0);

    // Most popular link (max clicks)
    const popular =
      mapped.length > 0
        ? mapped.reduce((max, item) =>
            item.clicks > max.clicks ? item : max
          ).short
        : "No data";

    // Latest activity across all links
    const latestActivity =
      mapped
        .filter(i => i.rawLastClicked !== null)
        .sort((a, b) => new Date(b.rawLastClicked) - new Date(a.rawLastClicked))[0]
        ?.lastClicked || "No activity";

    const stats = {
      totalLinks,
      totalClicks,
      popular,
      activity: latestActivity,
    };

    res.json({
      success: true,
      stats,
      links: mapped,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





// ----------------------
// GET SINGLE LINK BY ID (with full 12 months for graph)
// ----------------------
export const getLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await ShortLink.findById(id);

    if (!link)
      return res.status(404).json({ success: false, message: "Link not found" });

    // Prepare 12 months
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const currentYear = new Date().getFullYear();

    const fullMonths = monthNames.map((m) => ({
      month: `${m} ${currentYear}`,
      clicks: 0,
    }));

    // Merge with existing monthlyClicks
    link.monthlyClicks.forEach((m) => {
      const index = fullMonths.findIndex(fm => fm.month === m.month);
      if (index >= 0) fullMonths[index].clicks = m.clicks;
    });

    res.json({
      success: true,
      data: {
        ...link.toObject(),
        monthlyClicks: fullMonths,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// ----------------------
// REDIRECT SHORT URL
// ----------------------
export const redirectShortURL = async (req, res) => {
  try {
    const { code } = req.params;
    const link = await ShortLink.findOne({ shortCode: code });
    if (!link) return res.status(404).json({ message: "Link not found" });

    // Increment total clicks & last clicked
    link.clicks += 1;
    link.lastClickedAt = new Date();

    // Increment monthly clicks
    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const currentMonth = monthNames[now.getMonth()] + " " + now.getFullYear(); // e.g., "Nov 2025"

    // Check if month entry exists
    const monthEntry = link.monthlyClicks.find(m => m.month === currentMonth);

    if (monthEntry) {
      monthEntry.clicks += 1;
    } else {
      link.monthlyClicks.push({ month: currentMonth, clicks: 1 });
    }

    await link.save();

    res.redirect(link.longUrl);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




