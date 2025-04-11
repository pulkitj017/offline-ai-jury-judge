import { Controller, Post, Body, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { GitService, CommitInfo } from './git.service';
import { ReviewService } from '../review/review.service';

class AnalyzeRepoDto {
  repoUrl: string;
  teamName: string;
  problemStatement: string;
}

@Controller('git')
export class GitController {
  constructor(
    private readonly gitService: GitService,
    @Inject(forwardRef(() => ReviewService)) private readonly reviewService: ReviewService
  ) {}
  
  @Post('analyze')
  async analyzeRepo(@Body() analyzeRepoDto: AnalyzeRepoDto): Promise<{ success: boolean; data: any }> {
    const { repoUrl, teamName, problemStatement } = analyzeRepoDto;
    
    if (!repoUrl || !teamName || !problemStatement) {
      throw new HttpException('Repository URL, team name, and problem statement are required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const commitHistory = await this.gitService.analyzeRepository(repoUrl, teamName);
      
      // Process commits in batches and review each batch
      const reviewResults = await this.reviewService.reviewTeamCode({
        problemStatement,
        teamSummary: teamName,
        commitHistory
      });

      return { 
        success: true, 
        data: {
          commitHistory,
          review: reviewResults
        }
      };
    } catch (error) {
      throw new HttpException(
        `Failed to analyze repository: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
