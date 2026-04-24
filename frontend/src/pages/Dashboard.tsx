import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Bell, Plus, LayoutGrid, ListTodo, Calendar, ChevronRight, Briefcase, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Project State
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, notifRes] = await Promise.all([
          api.get('/projects'),
          api.get('/notifications')
        ]);
        if (projRes.data.success) setProjects(projRes.data.projects);
        if (notifRes.data.success) setNotifications(notifRes.data.notifications);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', { name: projectName, description: projectDesc });
      if (res.data.success) {
        toast.success("Project created successfully");
        setProjects([...projects, { ...res.data.project, _count: { stories: 0 } }]);
        setProjectName('');
        setProjectDesc('');
        setIsDialogOpen(false);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Welcome Back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-secondary" />
            Manage your ongoing engineering projects and tasks.
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">Initiate New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wide">Project Name</Label>
                  <Input 
                    placeholder="e.g., Next-Gen Connectivity Platform"
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)} 
                    required 
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wide">Project Description</Label>
                  <Textarea 
                    placeholder="Briefly describe the project goals..."
                    value={projectDesc} 
                    onChange={(e) => setProjectDesc(e.target.value)} 
                    className="min-h-[100px] resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-bold">Create Project Workspace</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-primary" />
              Active Projects
              <Badge variant="secondary" className="ml-2 px-3 py-1 text-sm">{projects.length}</Badge>
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[200px] bg-muted animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="bg-muted/30 border-dashed border-2 py-20">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                  <FolderKanban className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-8 max-w-xs">Start by creating a new project to manage your team's workflow.</p>
                <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map((p) => (
                <Link to={`/projects/${p.id}`} key={p.id} className="group">
                  <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1 bg-card">
                    <div className="h-2 w-full bg-primary" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{p.name}</CardTitle>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Active</Badge>
                      </div>
                      <CardDescription className="line-clamp-2 min-h-[40px] text-sm">
                        {p.description || 'Deliver cutting-edge technology solutions through collaborative agile development.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-muted/50 p-3 rounded-xl flex items-center gap-3">
                          <ListTodo className="w-4 h-4 text-secondary" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">User Stories</p>
                            <p className="text-lg font-bold">{p._count?.stories || 0}</p>
                          </div>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-xl flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Started</p>
                            <p className="text-sm font-bold">{new Date(p.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-end">
                       <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details <ChevronRight className="w-3 h-3" />
                       </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Bell className="w-6 h-6 text-secondary" />
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 5).map(n => (
              <Card key={n.id} className={`p-4 border-none shadow-sm transition-colors hover:bg-muted/30 ${!n.isRead ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}>
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  <div>
                    <p className="text-sm font-medium leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-12 bg-muted/20 rounded-2xl border-dashed border-2">
                <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
              </div>
            )}
            {notifications.length > 5 && (
              <Button variant="ghost" className="w-full text-primary font-bold">View All Notifications</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


