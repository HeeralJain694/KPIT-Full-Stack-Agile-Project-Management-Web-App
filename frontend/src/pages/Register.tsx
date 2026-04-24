import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-card rounded-2xl overflow-hidden shadow-2xl border">
        <div className="hidden md:flex flex-col justify-between p-12 bg-secondary text-white relative overflow-hidden">
          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-secondary font-bold text-2xl">K</span>
              </div>
              <span className="font-bold text-2xl tracking-tight">KPIT <span className="opacity-80 font-medium">Agile</span></span>
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">Join the Network of Innovators.</h2>
            <p className="text-white/80 text-lg">
              Create your account to start collaborating with teams across the globe using our advanced project management tool.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-4 text-sm font-medium">
            <UserPlus className="w-5 h-5 text-primary" />
            <span>Integrated Team Collaboration</span>
          </div>

          {/* Decorative background elements */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Create Account</h3>
            <p className="text-muted-foreground">Start your journey with KPIT Agile today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="name@kpit.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold bg-secondary hover:bg-secondary/90 text-white" disabled={loading}>
              {loading ? 'Creating Account...' : 'Get Started'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-semibold hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
