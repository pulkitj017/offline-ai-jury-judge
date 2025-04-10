
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types
export type Team = {
  id: string;
  name: string;
  repoUrl: string;
  summary: string;
  reviewStatus: 'pending' | 'inProgress' | 'completed';
  commitHistory?: any[]; // To store the commit history from the backend
  scores?: {
    relevance: number;
    performance: number;
    security: number;
    cost: number;
    vulnerability: number;
    aiUsage: number;
  };
  explanations?: {
    relevance: string;
    performance: string;
    security: string;
    cost: string;
    vulnerability: string;
    aiUsage: string;
  };
};

type TeamContextType = {
  teams: Team[];
  problemStatement: string;
  setProblemStatement: (statement: string) => void;
  addTeam: (team: Omit<Team, 'id' | 'reviewStatus'>) => void;
  reviewTeam: (id: string) => Promise<void>;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [problemStatement, setProblemStatement] = useState<string>('');

  const addTeam = (team: Omit<Team, 'id' | 'reviewStatus'>) => {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
      reviewStatus: 'pending',
    };
    setTeams([...teams, newTeam]);
  };

  // Mock review function that simulates backend processing
  const reviewTeam = async (id: string) => {
    // Mark team as in progress
    setTeams(prev =>
      prev.map(team =>
        team.id === id ? { ...team, reviewStatus: 'inProgress' } : team
      )
    );

    try {
      // Find the team to review
      const teamToReview = teams.find(team => team.id === id);
      
      if (!teamToReview) {
        throw new Error('Team not found');
      }

      // In a real app, this would call the backend API
      // For this local-only app, we'll simulate the call
      console.log(`Analyzing repo: ${teamToReview.repoUrl}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock scores and explanations
      const generateScore = () => Math.floor(Math.random() * 10) + 1;
      const scores = {
        relevance: generateScore(),
        performance: generateScore(),
        security: generateScore(),
        cost: generateScore(),
        vulnerability: generateScore(),
        aiUsage: generateScore(),
      };

      const explanations = {
        relevance: `The solution addresses ${scores.relevance > 5 ? 'most' : 'some'} of the core requirements outlined in the problem statement.`,
        performance: `Performance metrics indicate ${scores.performance > 5 ? 'good' : 'adequate'} response times and resource utilization.`,
        security: `Security analysis revealed ${scores.security > 5 ? 'few' : 'several'} potential vulnerabilities in the implementation.`,
        cost: `The solution demonstrates ${scores.cost > 5 ? 'efficient' : 'reasonable'} resource usage and scaling potential.`,
        vulnerability: `Code review identified ${scores.vulnerability > 5 ? 'minimal' : 'moderate'} vulnerability concerns that may need addressing.`,
        aiUsage: `The implementation shows ${scores.aiUsage > 5 ? 'innovative' : 'standard'} use of AI technologies to solve the problem.`,
      };

      // Mock commit history that would come from the backend
      const mockCommitHistory = [
        {
          hash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
          author: "John Doe",
          email: "john@example.com",
          timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
          message: "Initial commit",
          changedFiles: ["README.md", "index.js"],
          diff: "@@ -0,0 +1,4 @@\n+# Project\n+\n+This is a new project.\n+"
        },
        {
          hash: "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1",
          author: "Jane Smith",
          email: "jane@example.com",
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          message: "Add main functionality",
          changedFiles: ["src/main.js", "src/utils.js"],
          diff: "@@ -0,0 +1,10 @@\n+function main() {\n+  console.log('Hello world');\n+  return true;\n+}\n+"
        }
      ];

      // Update team with results
      setTeams(prev =>
        prev.map(team =>
          team.id === id
            ? {
                ...team,
                reviewStatus: 'completed',
                scores,
                explanations,
                commitHistory: mockCommitHistory
              }
            : team
        )
      );
    } catch (error) {
      console.error('Error reviewing team:', error);
      
      // Update team status to show error
      setTeams(prev =>
        prev.map(team =>
          team.id === id
            ? {
                ...team,
                reviewStatus: 'pending' // Reset to pending so they can try again
              }
            : team
        )
      );
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        problemStatement,
        setProblemStatement,
        addTeam,
        reviewTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamProvider');
  }
  return context;
};
