
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface CommitInfo {
  hash: string;
  author: string;
  email: string;
  timestamp: string;
  message: string;
  changedFiles: string[];
  diff: string;
}

export class GitService {
  async analyzeRepository(repoUrl: string, teamName: string): Promise<CommitInfo[]> {
    const sanitizedTeamName = teamName.replace(/[^a-zA-Z0-9]/g, '_');
    const tempDir = `/tmp/${sanitizedTeamName}`;
    
    // Clean up any existing directory
    await this.cleanUp(tempDir);
    
    try {
      // Clone the repository
      await execAsync(`git clone ${repoUrl} ${tempDir}`);
      
      // Get commit hashes ordered from oldest to newest
      const { stdout: commitHashes } = await execAsync(
        'git log --reverse --format="%H"',
        { cwd: tempDir }
      );
      
      const commits = await Promise.all(
        commitHashes
          .trim()
          .split('\n')
          .map(hash => this.getCommitInfo(hash, tempDir))
      );
      
      return commits;
    } catch (error) {
      console.error('Error analyzing repository:', error);
      throw new Error(`Failed to analyze repository: ${error.message}`);
    } finally {
      // Clean up the temporary directory
      await this.cleanUp(tempDir);
    }
  }
  
  private async getCommitInfo(hash: string, repoPath: string): Promise<CommitInfo> {
    // Get commit metadata
    const { stdout: commitData } = await execAsync(
      `git show -s --format="%H|%an|%ae|%at|%s" ${hash}`,
      { cwd: repoPath }
    );
    
    const [commitHash, author, email, timestamp, message] = commitData.trim().split('|');
    
    // Get changed files
    const { stdout: changedFilesData } = await execAsync(
      `git diff-tree --no-commit-id --name-only -r ${hash}`,
      { cwd: repoPath }
    );
    
    const changedFiles = changedFilesData.trim().split('\n').filter(Boolean);
    
    // Get diff data
    const { stdout: diffData } = await execAsync(
      `git show --pretty=format:"" --patch ${hash}`,
      { cwd: repoPath }
    );
    
    return {
      hash: commitHash,
      author,
      email,
      timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
      message,
      changedFiles,
      diff: diffData.trim()
    };
  }
  
  private async cleanUp(directory: string): Promise<void> {
    try {
      if (fs.existsSync(directory)) {
        // On Unix-like systems, use rm -rf for recursive removal
        await execAsync(`rm -rf ${directory}`);
      }
    } catch (error) {
      console.error(`Error cleaning up directory ${directory}:`, error);
    }
  }
}
