import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import api from '../../api/axios';
import { toast } from 'sonner';
import { Calendar, User, MoreHorizontal, GripVertical } from 'lucide-react';

const STATUSES = ['To Do', 'In Progress', 'Done'];

function SortableTaskItem({ task }: { task: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString(), data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4 group">
      <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 bg-card overflow-hidden group-active:scale-[1.02]">
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between mb-3">
             <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold bg-muted/50 border-none px-2">
              {task.storyTitle}
            </Badge>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground p-1 rounded hover:bg-muted transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
          
          <p className="font-semibold text-sm mb-4 leading-tight">{task.title}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{task.assignee?.name || 'Unassigned'}</span>
            </div>
            
            {task.deadline && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KanbanBoard({ tasks, setTasks }: { tasks: any[], setTasks: any }) {
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveTask(active.data.current?.task);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((tasks: any) => {
        const activeIndex = tasks.findIndex((t: any) => t.id.toString() === activeId);
        const overIndex = tasks.findIndex((t: any) => t.id.toString() === overId);
        
        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setTasks((tasks: any) => {
        const activeIndex = tasks.findIndex((t: any) => t.id.toString() === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex].status = overId;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const task = tasks.find(t => t.id.toString() === taskId);
    if (!task) return;

    // Determine new status
    let newStatus = task.status;
    if (over.data.current?.type === 'Column') {
      newStatus = over.id;
    } else if (over.data.current?.type === 'Task') {
      const overTask = tasks.find(t => t.id.toString() === over.id);
      if (overTask) newStatus = overTask.status;
    }

    // Persist to DB if status changed
    const originalTask = tasks.find(t => t.id.toString() === taskId);
    if (originalTask && originalTask.status !== newStatus) {
      try {
        await api.put(`/tasks/${taskId}/status`, { status: newStatus });
        toast.success(`Moved to ${newStatus}`);
      } catch (e) {
        toast.error("Failed to update task status");
        // In a real app, we'd revert state here
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STATUSES.map(status => {
          const colTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className="flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    status === 'To Do' ? 'bg-muted-foreground/30' : 
                    status === 'In Progress' ? 'bg-secondary' : 'bg-primary'
                  }`} />
                  <h3 className="font-bold text-sm uppercase tracking-widest">{status}</h3>
                  <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] bg-muted/50 border-none font-bold">
                    {colTasks.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <SortableContext
                id={status}
                items={colTasks.map(t => t.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div 
                  className="flex-1 bg-muted/30 rounded-2xl p-4 transition-colors border border-transparent hover:border-primary/5" 
                  data-droppable-id={status}
                >
                  {colTasks.map(task => (
                    <SortableTaskItem key={task.id} task={task} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-muted rounded-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'ease-in-out' }}>
        {activeTask ? (
          <div className="w-[300px] rotate-3 scale-105 transition-transform duration-200 shadow-2xl">
            <Card className="border-none shadow-2xl bg-card">
              <CardContent className="p-4">
                 <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold bg-muted/50 border-none px-2 mb-3">
                  {activeTask.storyTitle}
                </Badge>
                <p className="font-semibold text-sm mb-4 leading-tight">{activeTask.title}</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{activeTask.assignee?.name || 'Unassigned'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

