import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';

export const createStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, priority } = req.body;
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check project membership
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: Number(projectId) } }
    });

    if (!membership) {
      res.status(403).json({ success: false, message: 'Not authorized for this project' });
      return;
    }

    const story = await prisma.userStory.create({
      data: {
        title,
        description,
        priority: priority || 'Medium',
        projectId: Number(projectId)
      }
    });

    res.status(201).json({ success: true, story });
  } catch (error) {
    next(error);
  }
};

export const updateStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status } = req.body;
    const userId = req.user.id;

    const story = await prisma.userStory.findUnique({
      where: { id: Number(id) },
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

    const updatedStory = await prisma.userStory.update({
      where: { id: Number(id) },
      data: { title, description, priority, status }
    });

    res.json({ success: true, story: updatedStory });
  } catch (error) {
    next(error);
  }
};
