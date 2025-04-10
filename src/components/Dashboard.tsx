
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProblemStatement from '@/components/ProblemStatement';
import TeamManagement from '@/components/TeamManagement';
import TeamTable from '@/components/TeamTable';
import Header from '@/components/Header';
import { useTeams } from '@/context/TeamContext';

const Dashboard: React.FC = () => {
  const { teams } = useTeams();
  const [activeTab, setActiveTab] = useState('problem');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <Tabs defaultValue="problem" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="problem">Problem Statement</TabsTrigger>
            <TabsTrigger value="teams">Team Management</TabsTrigger>
            <TabsTrigger value="reviews" disabled={teams.length === 0}>
              Reviews {teams.length > 0 ? `(${teams.length})` : ''}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="problem">
            <ProblemStatement onComplete={() => setActiveTab('teams')} />
          </TabsContent>
          
          <TabsContent value="teams">
            <TeamManagement onTeamAdded={() => setActiveTab('reviews')} />
          </TabsContent>
          
          <TabsContent value="reviews">
            <TeamTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
