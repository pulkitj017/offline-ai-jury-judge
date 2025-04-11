
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

export interface FileInfo {
  filename: string;
  extension: string;
  path: string;
  content: string;
  size: number;
}

export class GitService {
  async analyzeRepository(repoUrl: string, teamName: string): Promise<{
    commits: CommitInfo[],
    files: FileInfo[]
  }> {
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
      
      // Get all files in the repository
      const files = await this.getAllFiles(tempDir);
      
      return {
        commits,
        files
      };
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
  
  private async getAllFiles(repoPath: string): Promise<FileInfo[]> {
    const ignorePatterns = ['.git', 'node_modules', 'dist', 'build', '.cache', '.DS_Store'];
    
    const files: FileInfo[] = [];
    
    // Get all files recursively
    async function readFilesRecursively(dir: string, baseDir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        
        // Skip ignored directories and files
        if (ignorePatterns.some(pattern => 
          relativePath.includes(pattern) || entry.name.includes(pattern))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await readFilesRecursively(fullPath, baseDir);
        } else {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const extension = path.extname(entry.name).substring(1); // Remove the dot
            
            files.push({
              filename: entry.name,
              extension,
              path: relativePath,
              content,
              size: fs.statSync(fullPath).size
            });
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error);
          }
        }
      }
    }
    
    await readFilesRecursively(repoPath, repoPath);
    return files;
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
