import { AuditLog } from '../models/index.js';

export const logAuditAction = async ({ req, user, action, targetEntity, targetId = '', details = '' }) => {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
    const userId = user?._id || user?.id || null;
    const userName = user?.name || user?.email || 'System/Guest';

    await AuditLog.create({
      user: userId,
      userName,
      action,
      targetEntity,
      targetId: String(targetId),
      ipAddress,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details),
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};
