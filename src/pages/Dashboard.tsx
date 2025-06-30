
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  BarChart3, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Layout } from '@/components/Layout';

interface DashboardStats {
  totalJobs: number;
  totalConsultants: number;
  activeMatches: number;
  pendingNotifications: number;
  completedMatches: number;
  recentActivity: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalConsultants: 0,
    activeMatches: 0,
    pendingNotifications: 0,
    completedMatches: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [workflowStatus, setWorkflowStatus] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [jobsResponse, consultantsResponse, notificationsResponse, workflowResponse] = await Promise.all([
        apiService.getJobDescriptions(),
        apiService.getConsultantProfiles(),
        apiService.getNotifications(),
        apiService.getWorkflowStatuses(),
      ]);

      setStats({
        totalJobs: jobsResponse.data?.length || 0,
        totalConsultants: consultantsResponse.data?.length || 0,
        activeMatches: 5, // Mock data
        pendingNotifications: notificationsResponse.data?.length || 0,
        completedMatches: 12, // Mock data
        recentActivity: [], // Mock data
      });

      setWorkflowStatus(workflowResponse.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mockWorkflowSteps = [
    { name: 'JD Uploaded', completed: true, active: false },
    { name: 'Profiles Compared', completed: true, active: false },
    { name: 'Results Ranked', completed: false, active: true },
    { name: 'Email Sent', completed: false, active: false },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's what's happening with your recruitment matches.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Job Descriptions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Consultants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConsultants}</div>
              <p className="text-xs text-muted-foreground">
                +5 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMatches}</div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingNotifications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting action
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Workflow Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Current Workflow Status
              </CardTitle>
              <CardDescription>
                Real-time progress of document matching process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockWorkflowSteps.map((step, index) => (
                <div key={step.name} className="flex items-center space-x-3">
                  <div
                    className={`progress-step w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed
                        ? 'completed'
                        : step.active
                        ? 'active'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.active ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {step.completed
                        ? 'Completed'
                        : step.active
                        ? 'In Progress'
                        : 'Pending'}
                    </div>
                  </div>
                  {step.active && (
                    <div className="w-24">
                      <Progress value={65} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Matches
              </CardTitle>
              <CardDescription>Latest matching results and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Senior React Developer</div>
                    <div className="text-sm text-muted-foreground">3 matches found</div>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Full Stack Engineer</div>
                    <div className="text-sm text-muted-foreground">Processing...</div>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">DevOps Engineer</div>
                    <div className="text-sm text-muted-foreground">No matches found</div>
                  </div>
                  <Badge variant="destructive">No Match</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for recruiters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Job Description
                </Button>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add Consultant Profile
                </Button>
                <Button variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Match Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
