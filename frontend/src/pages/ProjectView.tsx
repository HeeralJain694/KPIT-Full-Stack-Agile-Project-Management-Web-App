import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Plus, Settings, Users, Info, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { Badge } from '../components/ui/badge';

export default function ProjectView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New Story State
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDesc, setStoryDesc] = useState('');
  const [storyPriority, setStoryPriority] = useState('Medium');
  
  // New Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
      }
    } catch (e) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/${id}/stories`, { title: storyTitle, description: storyDesc, priority: storyPriority });
      if (res.data.success) {
        toast.success('User Story created');
        setStoryTitle('');
        setStoryDesc('');
        setStoryPriority('Medium');
        fetchProject();
      }
    } catch (error) {
      toast.error('Failed to create story');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;
    try {
      const payload: any = { title: taskTitle, description: taskDesc };
      if (taskDeadline) payload.deadline = new Date(taskDeadline).toISOString();
      payload.assignedTo = user?.id; 

      const res = await api.post(`/stories/${selectedStory.id}/tasks`, payload);
      if (res.data.success) {
        toast.success('Task created');
        setTaskTitle('');
        setTaskDesc('');
        setTaskDeadline('');
        setSelectedStory(null);
        fetchProject();
      }
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const updateTasksLocally = (newTasks: any[]) => {
    // This is a simplified way to update the local state optimistically
    // We rebuild the project structure from the flat task list
    setProject((prev: any) => {
      if (!prev) return prev;
      const updatedStories = prev.stories.map((story: any) => ({
        ...story,
        tasks: newTasks.filter(t => t.storyId === story.id)
      }));
      return { ...prev, stories: updatedStories };
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Loading project workspace...</p>
    </div>
  );
  
  if (!project) return (
    <div className="container mx-auto p-12 text-center">
      <div className="max-w-md mx-auto bg-card p-8 rounded-2xl shadow-sm border">
        <Info className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for might have been deleted or you don't have access.</p>
        <Button asChild>
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );

  // Flatten tasks for the kanban board
  const allTasks = project.stories.reduce((acc: any[], story: any) => {
    return [...acc, ...story.tasks.map((t: any) => ({ ...t, storyTitle: story.title, storyId: story.id }))];
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-primary">{project.name}</h1>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none px-3 py-1">In Development</Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-medium">Project ID: #{project.id}</span>
              <span className="text-muted-foreground/30">|</span>
              <span>{project.description || 'Enterprise-grade engineering solution'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex -space-x-3 mr-4">
            {project.members.slice(0, 3).map((m: any) => (
              <div key={m.id} className="w-9 h-9 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground uppercase shadow-sm" title={m.user.name}>
                {m.user.name.charAt(0)}
              </div>
            ))}
            {project.members.length > 3 && (
              <div className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          <Button variant="outline" size="icon" className="rounded-full"><Users className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-full"><Settings className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Controls Bar */}
        <div className="bg-card p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 px-2">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-secondary" />
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Board View</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                  <Plus className="w-4 h-4 mr-2" /> New User Story
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">Create User Story</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateStory} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wide">Story Title</Label>
                    <Input 
                      placeholder="As a user, I want to..."
                      value={storyTitle} 
                      onChange={(e) => setStoryTitle(e.target.value)} 
                      required 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wide">Detailed Description</Label>
                    <Textarea 
                      placeholder="Provide acceptance criteria and details..."
                      value={storyDesc} 
                      onChange={(e) => setStoryDesc(e.target.value)} 
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wide">Business Priority</Label>
                    <select 
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-medium focus:ring-2 focus:ring-primary"
                      value={storyPriority}
                      onChange={(e) => setStoryPriority(e.target.value)}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20">Initialize Story</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" /> Quick Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">Add Task to Story</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wide">Parent User Story</Label>
                    <select 
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-medium focus:ring-2 focus:ring-primary"
                      onChange={(e) => setSelectedStory(project.stories.find((s:any) => s.id === Number(e.target.value)))}
                      required
                    >
                      <option value="">Link to a user story...</option>
                      {project.stories.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wide">Task Heading</Label>
                    <Input 
                      placeholder="e.g., Implement API endpoint"
                      value={taskTitle} 
                      onChange={(e) => setTaskTitle(e.target.value)} 
                      required 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wide">Completion Deadline</Label>
                    <Input 
                      type="datetime-local" 
                      value={taskDeadline} 
                      onChange={(e) => setTaskDeadline(e.target.value)} 
                      className="h-11"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20">Deploy Task</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board Section */}
        <div className="min-h-[600px] bg-muted/20 p-6 rounded-3xl border border-dashed">
          {allTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <ListChecks className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-muted-foreground mb-2">No tasks deployed yet</h3>
              <p className="text-muted-foreground max-w-sm mb-8">Initialize a user story and add tasks to start the agile workflow.</p>
            </div>
          ) : (
            <KanbanBoard 
              tasks={allTasks} 
              setTasks={updateTasksLocally} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

