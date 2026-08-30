const AuditLog = require('../models/AuditLog');

const logAuditAction = async ({
  req,
  user,
  action,
  entityType,
  entityId = '',
  details = {},
  status = 'SUCCESS',
}) => {
  try {
    const actor = user || req?.user;
    const ip = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    await AuditLog.create({
      user: actor?._id || null,
      userName: actor?.name || 'Anonymous',
      userRole: actor?.role || 'anonymous',
      action,
      entityType,
      entityId: entityId ? String(entityId) : '',
      details,
      ipAddress: String(ip),
      status,
    });
  } catch (err) {
    console.error('[Audit Logger] Failed to record audit log:', err.message);
  }
};

module.exports = { logAuditAction };
