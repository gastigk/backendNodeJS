import customError from '../services/error.log.js';
import { UserService } from '../repositories/index.js';
import loggers from '../config/logger.js';
import UserDTO from '../dtos/user.dto.js';
import customMessageSessions from '../services/sessions.log.js';

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function findInactiveUsers() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  try {
    const inactiveUsers = await UserService.getAll();
    console.log('\n');
    loggers.notice('Users list: ');
    inactiveUsers.forEach((user) => {
      let users = new UserDTO(user);

      if (user.updatedAt < oneYearAgo) {
        const formattedDate = formatDate(user.updatedAt);
        let messageA = `Inactive user: ${users.full_name} | Last login: ${formattedDate}`;
        customMessageSessions(messageA);
        loggers.warn(messageA);
      } else {
        let messageB = `Inactive user: ${users.full_name}`;
        customMessageSessions(messageB);
        loggers.info(messageB);
      }
    });
  } catch (error) {
    customError(error);
    loggers.error('Error searching for inactive users:');
  }
}
