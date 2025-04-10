
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { GitService, CommitInfo } from './git.service';

class AnalyzeRepoDto {
  repoUrl: string;
  teamName: string;
}

@Controller('git')
export class GitController {
  constructor(private readonly gitService: GitService) {}
  
  @Post('analyze')
  async analyzeRepo(@Body() analyzeRepoDto: AnalyzeRepoDto): Promise<{ success: boolean; data: CommitInfo[] }> {
    const { repoUrl, teamName } = analyzeRepoDto;
    
    if (!repoUrl || !teamName) {
      throw new HttpException('Repository URL and team name are required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const commitHistory = await this.gitService.analyzeRepository(repoUrl, teamName);
      return { success: true, data: commitHistory };
    } catch (error) {
      throw new HttpException(
        `Failed to analyze repository: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
