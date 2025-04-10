
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTeams } from '@/context/TeamContext';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TeamManagementProps {
  onTeamAdded: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ onTeamAdded }) => {
  const { addTeam, teams } = useTeams();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim() || !repoUrl.trim() || !summary.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    addTeam({
      name: teamName,
      repoUrl,
      summary,
    });

    toast({
      title: "Team added",
      description: `${teamName} has been added to the review list.`,
    });

    // Reset form
    setTeamName('');
    setRepoUrl('');
    setSummary('');
    
    // Navigate to reviews tab if this is the first team
    if (teams.length === 0) {
      onTeamAdded();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserPlus className="h-6 w-6 text-jury-primary" />
          <CardTitle>Team Management</CardTitle>
        </div>
        <CardDescription>
          Add teams to be reviewed by the AI Jury.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repoUrl">GitHub Repository URL</Label>
            <Input
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="e.g., https://github.com/team/repo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Team Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of the team and their approach..."
              className="min-h-[100px]"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {teams.length > 0 && (
              <Button type="button" variant="outline" onClick={onTeamAdded}>
                View {teams.length} Team{teams.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
          <Button type="submit" className="bg-jury-primary hover:bg-jury-secondary">
            Add Team
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TeamManagement;
