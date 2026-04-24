import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: userId,
        members: {
          create: { userId, role: 'Admin' }
        }
      }
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { stories: true } }
      }
    });
    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id: Number(id),
        members: { some: { userId } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        stories: {
          include: { tasks: { include: { assignee: { select: { id: true, name: true } } } } }
        }
      }
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};
