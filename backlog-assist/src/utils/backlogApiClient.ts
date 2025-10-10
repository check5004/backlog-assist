// Backlog API Client implementation
// This is a placeholder implementation for future API integration

import type {
  BacklogApiClient,
  BacklogApiConfig,
  BacklogApiResponse,
  BacklogApiError,
  BacklogUser,
  BacklogProject,
  BacklogIssue,
  BacklogComment,
  BacklogAttachment,
  IssueQueryOptions
} from '../types/backlogApi';

export class BacklogApiClientImpl implements BacklogApiClient {
  private config: BacklogApiConfig | null = null;
  private isAuthenticated = false;
  private currentUser: BacklogUser | null = null;

  configure(config: BacklogApiConfig): void {
    this.config = config;
    console.log('Backlog API configured:', {
      baseUrl: config.baseUrl,
      projectKey: config.projectKey,
      hasApiKey: !!config.apiKey
    });
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.baseUrl && !!this.config.apiKey;
  }

  async authenticate(): Promise<BacklogApiResponse<BacklogUser>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'API configuration is required before authentication',
          code: 'CONFIG_REQUIRED'
        }
      };
    }

    try {
      console.log('Authenticating with Backlog API...');
      
      // Construct API URL for getting user information
      const baseUrl = this.config!.baseUrl.replace(/\/$/, '');
      const apiUrl = `${baseUrl}/api/v2/users/myself?apiKey=${this.config!.apiKey}`;
      
      // Make actual API call to authenticate
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Authentication failed';
        let errorCode = 'AUTH_FAILED';
        
        if (response.status === 401) {
          errorMessage = 'APIキーが無効です';
          errorCode = 'INVALID_API_KEY';
        } else if (response.status === 403) {
          errorMessage = 'APIアクセスが許可されていません';
          errorCode = 'ACCESS_DENIED';
        } else if (response.status === 404) {
          errorMessage = 'Backlog URLが正しくありません';
          errorCode = 'INVALID_URL';
        } else if (response.status >= 500) {
          errorMessage = 'Backlogサーバーエラーが発生しました';
          errorCode = 'SERVER_ERROR';
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            code: errorCode,
            statusCode: response.status
          }
        };
      }

      const userData: BacklogUser = await response.json();
      
      this.isAuthenticated = true;
      this.currentUser = userData;

      console.log('Authentication successful:', userData.name);

      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('Authentication error:', error);
      
      let errorMessage = 'Authentication failed';
      let errorCode = 'AUTH_FAILED';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'ネットワークエラー: Backlogサーバーに接続できません';
        errorCode = 'NETWORK_ERROR';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: {
          message: errorMessage,
          code: errorCode
        }
      };
    }
  }

  async getProject(projectKey: string): Promise<BacklogApiResponse<BacklogProject>> {
    if (!this.isAuthenticated) {
      return {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      };
    }

    try {
      console.log('Fetching project:', projectKey);
      
      // Construct API URL for getting project information
      const baseUrl = this.config!.baseUrl.replace(/\/$/, '');
      const apiUrl = `${baseUrl}/api/v2/projects/${projectKey}?apiKey=${this.config!.apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch project';
        let errorCode = 'PROJECT_FETCH_FAILED';
        
        if (response.status === 404) {
          errorMessage = `プロジェクト "${projectKey}" が見つかりません`;
          errorCode = 'PROJECT_NOT_FOUND';
        } else if (response.status === 403) {
          errorMessage = 'プロジェクトへのアクセス権限がありません';
          errorCode = 'ACCESS_DENIED';
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            code: errorCode,
            statusCode: response.status
          }
        };
      }

      const projectData: BacklogProject = await response.json();

      return {
        success: true,
        data: projectData
      };
    } catch (error) {
      console.error('Project fetch error:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch project',
          code: 'PROJECT_FETCH_FAILED'
        }
      };
    }
  }

  async getIssue(issueKey: string): Promise<BacklogApiResponse<BacklogIssue>> {
    if (!this.isAuthenticated) {
      return {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      };
    }

    try {
      // TODO: Implement actual API call
      console.log('Fetching issue:', issueKey);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock issue data
      const mockIssue: BacklogIssue = {
        id: 1,
        projectId: 1,
        issueKey: issueKey,
        keyId: parseInt(issueKey.split('-')[1]) || 1,
        issueType: {
          id: 1,
          projectId: 1,
          name: 'タスク',
          color: '#7ea800',
          displayOrder: 1
        },
        summary: `Sample Issue: ${issueKey}`,
        description: 'This is a sample issue description for testing purposes.',
        priority: {
          id: 3,
          name: '中'
        },
        status: {
          id: 1,
          name: '未対応',
          color: '#ed8077',
          displayOrder: 1
        },
        createdUser: this.currentUser!,
        created: new Date().toISOString()
      };

      return {
        success: true,
        data: mockIssue
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch issue',
          code: 'ISSUE_FETCH_FAILED'
        }
      };
    }
  }

  async getIssues(projectKey: string, options?: IssueQueryOptions): Promise<BacklogApiResponse<BacklogIssue[]>> {
    if (!this.isAuthenticated) {
      return {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      };
    }

    try {
      // TODO: Implement actual API call
      console.log('Fetching issues for project:', projectKey, 'with options:', options);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock issues list (empty for now)
      const mockIssues: BacklogIssue[] = [];

      return {
        success: true,
        data: mockIssues
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch issues',
          code: 'ISSUES_FETCH_FAILED'
        }
      };
    }
  }

  async addComment(issueKey: string, content: string): Promise<BacklogApiResponse<BacklogComment>> {
    if (!this.isAuthenticated) {
      return {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      };
    }

    try {
      // TODO: Implement actual API call
      console.log('Adding comment to issue:', issueKey);
      console.log('Comment content:', content);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock comment response
      const mockComment: BacklogComment = {
        id: Date.now(),
        content: content,
        createdUser: this.currentUser!,
        created: new Date().toISOString()
      };

      return {
        success: true,
        data: mockComment
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to add comment',
          code: 'COMMENT_ADD_FAILED'
        }
      };
    }
  }

  async getComments(issueKey: string): Promise<BacklogApiResponse<BacklogComment[]>> {
    if (!this.isAuthenticated) {
      return {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      };
    }

    try {
      // TODO: Implement actual API call
      console.log('Fetching comments for issue:', issueKey);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock comments list (empty for now)
      const mockComments: BacklogComment[] = [];

      return {
        success: true,
        data: mockComments
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch comments',
          code: 'COMMENTS_FETCH_FAILED'
        }
      };
    }
  }

  async uploadAttachment(issueKey: string, file: File): Promise<BacklogApiResponse<BacklogAttachment>> {
    if (!this.isAuthenticated) {
      return {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      };
    }

    try {
      // TODO: Implement actual file upload
      console.log('Uploading attachment to issue:', issueKey);
      console.log('File:', file.name, file.size, 'bytes');
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock attachment response
      const mockAttachment: BacklogAttachment = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        createdUser: this.currentUser!,
        created: new Date().toISOString()
      };

      return {
        success: true,
        data: mockAttachment
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to upload attachment',
          code: 'UPLOAD_FAILED'
        }
      };
    }
  }

  // Helper methods for getting current state
  getCurrentUser(): BacklogUser | null {
    return this.currentUser;
  }

  getConfig(): BacklogApiConfig | null {
    return this.config;
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  // Method to reset authentication state
  logout(): void {
    this.isAuthenticated = false;
    this.currentUser = null;
    console.log('Logged out from Backlog API');
  }
}

// Singleton instance for global use
export const backlogApiClient = new BacklogApiClientImpl();

// Utility functions for API integration
export const BacklogApiUtils = {
  /**
   * Extract project key from issue key
   * @param issueKey - Issue key like "PROJ-123"
   * @returns Project key like "PROJ"
   */
  extractProjectKey(issueKey: string): string {
    const match = issueKey.match(/^([A-Z]+)-\d+$/);
    return match ? match[1] : '';
  },

  /**
   * Validate issue key format
   * @param issueKey - Issue key to validate
   * @returns True if valid format
   */
  isValidIssueKey(issueKey: string): boolean {
    return /^[A-Z]+-\d+$/.test(issueKey);
  },

  /**
   * Format Backlog URL for issue
   * @param baseUrl - Backlog base URL
   * @param issueKey - Issue key
   * @returns Full URL to issue
   */
  formatIssueUrl(baseUrl: string, issueKey: string): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/view/${issueKey}`;
  },

  /**
   * Parse Backlog base URL to extract space name
   * @param baseUrl - Backlog base URL
   * @returns Space name or null if invalid
   */
  extractSpaceName(baseUrl: string): string | null {
    const match = baseUrl.match(/https?:\/\/([^.]+)\.backlog\.(jp|com|tool)/);
    return match ? match[1] : null;
  }
};