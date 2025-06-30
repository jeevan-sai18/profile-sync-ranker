
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  FileText, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface JobDescription {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills_required: string[];
  experience_level: string;
  status_notification: string;
  created_at: string;
}

export default function JobDescriptions() {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    skills_required: '',
    experience_level: 'Mid',
  });

  useEffect(() => {
    loadJobDescriptions();
  }, []);

  const loadJobDescriptions = async () => {
    setIsLoading(true);
    const response = await apiService.getJobDescriptions();
    if (response.data) {
      setJobDescriptions(response.data);
    }
    setIsLoading(false);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      ...newJob,
      requirements: newJob.requirements.split(',').map(r => r.trim()),
      skills_required: newJob.skills_required.split(',').map(s => s.trim()),
    };

    const response = await apiService.createJobDescription(jobData);
    if (response.data) {
      toast.success('Job description created successfully!');
      setIsCreateDialogOpen(false);
      setNewJob({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        skills_required: '',
        experience_level: 'Mid',
      });
      loadJobDescriptions();
    } else {
      toast.error('Failed to create job description');
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    const response = await apiService.uploadJobDescriptions(selectedFiles);
    if (!response.error) {
      toast.success('Job descriptions uploaded successfully!');
      setIsUploadDialogOpen(false);
      setSelectedFiles([]);
      loadJobDescriptions();
    } else {
      toast.error('Failed to upload job descriptions');
    }
  };

  const filteredJobs = jobDescriptions.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Descriptions</h1>
            <p className="text-muted-foreground">
              Manage job descriptions and requirements for consultant matching
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDFs
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Job Description PDFs</DialogTitle>
                  <DialogDescription>
                    Select PDF files containing job descriptions to upload and process
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="files">Select PDF Files</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Selected files: {selectedFiles.map(f => f.name).join(', ')}
                      </p>
                    </div>
                  )}
                  <Button onClick={handleFileUpload} className="w-full">
                    Upload Files
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Job Description</DialogTitle>
                  <DialogDescription>
                    Add a new job description for consultant matching
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                    <Textarea
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      placeholder="Bachelor's degree, 3+ years experience, etc."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      value={newJob.skills_required}
                      onChange={(e) => setNewJob({ ...newJob, skills_required: e.target.value })}
                      placeholder="React, Node.js, TypeScript, etc."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Job Description
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search job descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Job Descriptions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No job descriptions</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new job description.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription>
                    {job.company} • {job.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                  
                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.skills_required.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills_required.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills_required.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge 
                      variant={job.status_notification === 'active' ? 'default' : 'secondary'}
                    >
                      {job.status_notification || 'Active'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
