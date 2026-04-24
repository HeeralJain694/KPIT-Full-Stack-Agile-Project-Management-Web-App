import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { storyId } = req.params;
    const { title, description, deadline, assignedTo } = req.body;
    const userId = req.user.id;

    const story = await prisma.userStory.findUnique({
      where: { id: Number(storyId) },
      include: { project: true }
    });

    if (!story) {
      res.status(404).json({ success: false, message: 'Story not found' });
      return;
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: story.projectId } }
    });

    if (!membership) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        assignedTo: assignedTo || null,
        storyId: Number(storyId)
      }
    });

    // Notify assigned user if there is one
    if (assignedTo && assignedTo !== userId) {
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          message: `You have been assigned to a new task: ${title}`
        }
      });
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: { story: true }
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: task.story.projectId } }
    });

    if (!membership) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { status }
    });

    if (task.status !== status && task.assignedTo && task.assignedTo !== userId) {
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          message: `Task "${task.title}" status updated to ${status}`
        }
      });
    }

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    next(error);
  }
};
