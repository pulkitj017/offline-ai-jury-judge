import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ReviewService } from './review.service';
import { FileInfo } from '../git/git.service';

export interface ReviewResponse {
  success: boolean;
  data: any;
}

class ReviewRequestDto {
  problemStatement: string;
  teamSummary: string;
  commitHistory: any[];
  files: FileInfo[];
}

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  
  @Post()
  async reviewTeam(@Body() reviewRequestDto: ReviewRequestDto): Promise<ReviewResponse> {
    const { problemStatement, teamSummary, commitHistory, files } = reviewRequestDto;
    
    if (!problemStatement || !teamSummary || !commitHistory || !files) {
      throw new HttpException(
        'Missing required fields: problemStatement, teamSummary, commitHistory, or files',
        HttpStatus.BAD_REQUEST
      );
    }
    
    try {
      const reviewResults = await this.reviewService.reviewTeamCode({
        problemStatement,
        teamSummary,
        commitHistory,
        files,
      });
      
      return { 
        success: true, 
        data: reviewResults 
      };
    } catch (error) {
      throw new HttpException(
        `Failed to review team: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
