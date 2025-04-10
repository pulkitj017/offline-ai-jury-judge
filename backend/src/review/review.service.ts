
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface CommitInfo {
  hash: string;
  author: string;
  email: string;
  timestamp: string;
  message: string;
  changedFiles: string[];
  diff: string;
}

interface ReviewRequest {
  problemStatement: string;
  teamSummary: string;
  commitHistory: CommitInfo[];
}

interface ReviewScores {
  relevance: number;
  performance: number;
  security: number;
  cost: number;
  vulnerability: number;
  aiUsage: number;
  total: number;
}

interface ReviewExplanations {
  relevance: string;
  performance: string;
  security: string;
  cost: string;
  vulnerability: string;
  aiUsage: string;
}

interface ReviewResponse {
  scores: ReviewScores;
  explanations: ReviewExplanations;
}

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  async reviewTeamCode(reviewData: ReviewRequest): Promise<ReviewResponse> {
    try {
      // Format the commit history for better prompt readability
      const formattedCommitHistory = reviewData.commitHistory.map(commit => {
        return `
Commit: ${commit.hash}
Author: ${commit.author} (${commit.email})
Date: ${commit.timestamp}
Message: ${commit.message}
Files Changed: ${commit.changedFiles.join(', ')}
Diff:
${commit.diff}
`;
      }).join('\n---\n');

      // Create the prompt for the LLaMA model
      const prompt = `
You are an expert AI jury for a hackathon. A team has submitted the following GitHub commit history for a project solving this problem:

Problem Statement:
${reviewData.problemStatement}

Team Summary:
${reviewData.teamSummary}

Commit History:
${formattedCommitHistory}

Evaluate the code and development process using these categories:
1. Relevance (out of 10)
2. Performance (out of 10)
3. Security (out of 10)
4. Cost (out of 10)
5. Vulnerability (out of 10)
6. Smart AI Usage (out of 10) – Determine if AI tools were used based on commit structure, naming, comments, and messages

Give a score out of 10 for each, along with a short justification. 
Also calculate a final score by adding all scores and multiplying by 1.67 to get a result out of 100.

Return your evaluation in this exact JSON format:
{
  "scores": {
    "relevance": 0,
    "performance": 0,
    "security": 0,
    "cost": 0,
    "vulnerability": 0,
    "aiUsage": 0,
    "total": 0
  },
  "explanations": {
    "relevance": "",
    "performance": "",
    "security": "",
    "cost": "",
    "vulnerability": "",
    "aiUsage": ""
  }
}
`;

      // Send the prompt to the local LLaMA 3.1 model
      const response = await axios.post('http://localhost:11434/api/chat', {
        model: 'llama3.1',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      });

      // Extract the LLaMA response
      const llamaResponse = response.data.message.content;
      this.logger.log('LLaMA model response received');

      // Parse the JSON from the response
      // Find the JSON part in the response (it might be surrounded by markdown code blocks or text)
      const jsonMatch = llamaResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                         llamaResponse.match(/{[\s\S]*"scores"[\s\S]*"explanations"[\s\S]*}/);
      
      let reviewResult: ReviewResponse;
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
        reviewResult = JSON.parse(jsonStr);
      } else {
        // If the response is not properly formatted, return a default response
        this.logger.error('Failed to parse JSON from LLaMA response. Using default response.');
        reviewResult = this.getDefaultReviewResponse();
      }

      return reviewResult;
    } catch (error) {
      this.logger.error(`Error reviewing team code: ${error.message}`);
      return this.getDefaultReviewResponse();
    }
  }

  private getDefaultReviewResponse(): ReviewResponse {
    return {
      scores: {
        relevance: 5,
        performance: 5,
        security: 5,
        cost: 5,
        vulnerability: 5,
        aiUsage: 5,
        total: 50,
      },
      explanations: {
        relevance: 'Could not evaluate due to an error processing the review.',
        performance: 'Could not evaluate due to an error processing the review.',
        security: 'Could not evaluate due to an error processing the review.',
        cost: 'Could not evaluate due to an error processing the review.',
        vulnerability: 'Could not evaluate due to an error processing the review.',
        aiUsage: 'Could not evaluate due to an error processing the review.',
      },
    };
  }
}
