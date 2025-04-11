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

export interface ReviewResponse {
  scores: ReviewScores;
  explanations: ReviewExplanations;
}

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  async reviewTeamCode(reviewData: ReviewRequest): Promise<ReviewResponse> {
    try {
      // Process each commit individually and aggregate results
      const commitResults = await Promise.all(
        reviewData.commitHistory.map(commit => 
          this.reviewSingleCommit(commit, reviewData.problemStatement, reviewData.teamSummary)
        )
      );
      // Aggregate all commit review results
      return this.aggregateReviewResults(commitResults);
    } catch (error) {
      this.logger.error(`Error reviewing team code: ${error.message}`);
      return this.getDefaultReviewResponse();
    }
  }

  private async reviewSingleCommit(
    commit: CommitInfo, 
    problemStatement: string, 
    teamSummary: string
  ): Promise<ReviewResponse> {
    const formattedCommit = `
Commit: ${commit.hash}
Author: ${commit.author} (${commit.email})
Date: ${commit.timestamp}
Message: ${commit.message}
Files Changed: ${commit.changedFiles.join(', ')}
Diff:
${commit.diff}
`;

    const prompt = `
You are an expert AI jury for a hackathon reviewing a single commit. Context:

Problem Statement:
${problemStatement}

Team Summary:
${teamSummary}

Commit Details:
${formattedCommit}

Evaluate the code and development process using these categories:
1. Relevance (out of 10) - How well the solution addresses the problem statement
2. Performance (out of 10) - How efficiently the code operates
3. Security (out of 10) - How well protected against threats
4. Cost (out of 10) - How cost-efficient the implementation would be
5. Vulnerability (out of 10) - How robust against unexpected inputs/conditions
6. Smart AI Usage (out of 10) - Evaluate if and how AI tools were used in development based on:
   - Commit message language and structure
   - Code patterns, comments, formatting, and variable names
   - Any indications of tool use (Copilot, ChatGPT, etc.) in messages or code

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

    try {
      const response = await axios.post('http://localhost:11434/api/chat', {
        model: 'llama3.1:latest',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer psai_eb1856936c7646b1914d2ba64317997e`,
        },
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

  private aggregateReviewResults(results: ReviewResponse[]): ReviewResponse {
    type AggregatedReview = {
      scores: ReviewScores;
      explanations: {
        [K in keyof ReviewExplanations]: string[];
      };
    };

    const aggregated: AggregatedReview = {
      scores: {
        relevance: 0,
        performance: 0,
        security: 0,
        cost: 0,
        vulnerability: 0,
        aiUsage: 0,
        total: 0
      },
      explanations: {
        relevance: [],
        performance: [],
        security: [],
        cost: [],
        vulnerability: [],
        aiUsage: []
      }
    };

    // Average scores and combine explanations
    results.forEach(result => {
      Object.keys(result.scores).forEach(key => {
        if (key !== 'total') {
          aggregated.scores[key] += result.scores[key] / results.length;
        }
      });
      Object.keys(result.explanations).forEach(key => {
        if (result.explanations[key] && aggregated.explanations[key]) {
          aggregated.explanations[key].push(result.explanations[key]);
        }
      });
    });

    // Calculate total score
    aggregated.scores.total = Object.keys(aggregated.scores)
      .filter(key => key !== 'total')
      .reduce((sum, key) => sum + aggregated.scores[key], 0) * 1.67;

    // Convert the final result to ReviewResponse format
    return {
      scores: aggregated.scores,
      explanations: Object.keys(aggregated.explanations).reduce((acc, key) => ({
        ...acc,
        [key]: aggregated.explanations[key]
          .filter((exp, i, arr) => arr.indexOf(exp) === i)
          .join(' ')
      }), {}) as ReviewExplanations
    };
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
