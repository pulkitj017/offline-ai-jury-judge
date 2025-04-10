
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types
export type Team = {
  id: string;
  name: string;
  repoUrl: string;
  summary: string;
  reviewStatus: 'pending' | 'inProgress' | 'completed';
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
  teams: Team[];
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

    // Update team with results
    setTeams(prev =>
      prev.map(team =>
        team.id === id
          ? {
              ...team,
              reviewStatus: 'completed',
              scores,
              explanations,
            }
          : team
      )
    );
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
