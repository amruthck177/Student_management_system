const AuditLog = require('../models/AuditLog');

// @desc    Get audit trail logs with filtering & pagination
// @route   GET /api/audit-logs
// @access  Admin
const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action && action !== 'all') query.action = action;
    if (entityType && entityType !== 'all') query.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAuditLogs,
};
