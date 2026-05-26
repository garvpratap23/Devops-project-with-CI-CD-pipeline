import { AuditLog } from '../models';

export class AuditLogRepository {
  async create(data: {
    user_id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
  }): Promise<AuditLog> {
    return AuditLog.create(data);
  }

  async findByUser(userId: number, limit = 50): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { user_id: userId },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  async findByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { entity_type: entityType, entity_id: entityId },
      order: [['timestamp', 'DESC']],
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
