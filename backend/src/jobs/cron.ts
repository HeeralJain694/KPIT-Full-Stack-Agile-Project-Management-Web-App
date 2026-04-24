import cron from 'node-cron';
import { prisma } from '../db';

export const initCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running task deadline check...');
    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await prisma.task.findMany({
        where: {
          deadline: {
            gte: now,
            lte: next24Hours
          },
          status: {
            not: 'Done'
          },
          assignedTo: {
            not: null
          }
        }
      });

      for (const task of tasks) {
        if (task.assignedTo) {
          // Prevent duplicate notifications for the same task deadline by checking recent notifications
          const recentNotif = await prisma.notification.findFirst({
            where: {
              userId: task.assignedTo,
              message: { contains: `Upcoming deadline for task: ${task.title}` }
            }
          });

          if (!recentNotif) {
            await prisma.notification.create({
              data: {
                userId: task.assignedTo,
                message: `Reminder: Upcoming deadline for task: ${task.title} (Due: ${task.deadline?.toISOString()})`
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  });
};
