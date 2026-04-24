import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'Admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};

export const requireProjectMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const projectId = Number(req.params.id || req.params.projectId); // Support both route styles
  if (!projectId || isNaN(projectId)) {
    res.status(400).json({ success: false, message: 'Invalid project ID format' });
    return;
  }

  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: projectId
        }
      }
    });

    if (!membership && req.user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Project membership required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying project membership' });
    return;
  }
};
