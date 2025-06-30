
const API_BASE_URL = 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string }>('/users/token', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
  }) {
    return this.request('/users/user_details', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(email: string) {
    return this.request(`/users/verify-email?email=${email}`, {
      method: 'POST',
    });
  }

  async resetPassword(email: string, newPassword: string) {
    return this.request(`/users/reset-password?email=${email}&new_password=${newPassword}`, {
      method: 'PUT',
    });
  }

  // Job Description endpoints
  async getJobDescriptions() {
    return this.request<any[]>('/job-description/');
  }

  async getJobDescriptionById(id: number) {
    return this.request(`/job-description/${id}`);
  }

  async createJobDescription(jobData: any) {
    return this.request('/job-description/', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async searchJobDescriptionsByTitle(title: string) {
    return this.request(`/job-description/searching_by_title/?title=${title}`);
  }

  async uploadJobDescriptions(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return this.request('/job-description/upload-job-descriptions/', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: formData,
    });
  }

  // Consultant Profile endpoints
  async getConsultantProfiles() {
    return this.request<any[]>('/consultant-profile/');
  }

  async getConsultantProfileById(id: number) {
    return this.request(`/consultant-profile/${id}`);
  }

  async searchConsultantsBySkill(skill: string) {
    return this.request(`/consultant-profile/search?skill=${skill}`);
  }

  async createConsultantProfile(profileData: any) {
    return this.request('/consultant-profile/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async uploadConsultantProfiles(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return this.request('/consultant-profile/upload-pdfs/', {
      method: 'POST',
      body: formData,
    });
  }

  // Match Result endpoints
  async getMatchResults(jobDescriptionId: number) {
    return this.request<any[]>(`/match-result/all-matches/${jobDescriptionId}`);
  }

  async getTopMatches(jobDescriptionId: number, topN: number = 3) {
    return this.request<any[]>(`/match-result/job/${jobDescriptionId}/top?top_n=${topN}`);
  }

  async createMatchResult(matchData: any) {
    return this.request('/match-result/', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  // Workflow Status endpoints
  async getWorkflowStatuses() {
    return this.request<any[]>('/workflow-status/');
  }

  async getWorkflowStatusById(id: number) {
    return this.request(`/workflow-status/${id}`);
  }

  async updateWorkflowProgress(id: number, progress: string, steps: Record<string, boolean>) {
    return this.request(`/workflow-status/${id}/progress?progress=${progress}`, {
      method: 'PUT',
      body: JSON.stringify({ steps }),
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request<any[]>('/notifications/');
  }

  async getNotificationsByJobId(jobId: number) {
    return this.request<any[]>(`/notifications/job/${jobId}`);
  }

  async createNotification(notificationData: any) {
    return this.request('/notifications/', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }
}

export const apiService = new ApiService();
