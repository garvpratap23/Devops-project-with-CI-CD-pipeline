import User from './User';
import Task from './Task';
import AuditLog from './AuditLog';
import RefreshToken from './RefreshToken';

// Associations
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export { User, Task, AuditLog, RefreshToken };

export const initModels = (): void => {
  // Models are initialized when imported above
  // Associations are defined in this file
};
