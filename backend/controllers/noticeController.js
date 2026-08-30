const Notice = require('../models/Notice');
const { logAuditAction } = require('../middleware/auditLogger');

// @desc    Get notices for the authenticated role and department
// @route   GET /api/notices
// @access  Public / Authenticated
const getNotices = async (req, res) => {
  try {
    const role = req.user ? req.user.role : 'all';
    const dept = req.user?.department || 'All';

    const query = {
      $or: [
        { audience: 'all' },
        { audience: `${role}s` }, // 'teachers', 'students', 'parents'
        { audience: role },
        { targetDepartment: { $in: ['All', dept] } },
      ],
    };

    const notices = await Notice.find(query)
      .populate('postedBy', 'name role email')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, count: notices.length, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Admin
const createNotice = async (req, res) => {
  try {
    const { title, body, audience = 'all', targetDepartment = 'All', priority = 'medium', isPinned = false } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Notice title and body are required' });
    }

    const notice = await Notice.create({
      title,
      body,
      postedBy: req.user._id,
      audience,
      targetDepartment,
      priority,
      isPinned: Boolean(isPinned),
    });

    await logAuditAction({
      req,
      action: 'CREATE',
      entityType: 'Notice',
      entityId: notice._id,
      details: { title, audience, priority },
    });

    res.status(201).json({ success: true, message: 'Notice published successfully', notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Admin
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    await logAuditAction({
      req,
      action: 'DELETE',
      entityType: 'Notice',
      entityId: req.params.id,
      details: { title: notice.title },
    });

    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice,
};
