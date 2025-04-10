import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ReviewService } from './review.service';

export interface ReviewResponse {
  success: boolean;
  data: any;
}

class ReviewRequestDto {
  problemStatement: string;
  teamSummary: string;
  commitHistory: any[];
}

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  
  @Post()
  async reviewTeam(@Body() reviewRequestDto: ReviewRequestDto): Promise<ReviewResponse> {
    const { problemStatement, teamSummary, commitHistory } = reviewRequestDto;
    
    if (!problemStatement || !teamSummary || !commitHistory) {
      throw new HttpException(
        'Missing required fields: problemStatement, teamSummary, or commitHistory',
        HttpStatus.BAD_REQUEST
      );
    }
    
    try {
      const reviewResults = await this.reviewService.reviewTeamCode({
        problemStatement,
        teamSummary,
        commitHistory,
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
