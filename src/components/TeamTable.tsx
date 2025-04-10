
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTeams } from '@/context/TeamContext';
import { Play, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import TeamReviewDialog from '@/components/TeamReviewDialog';
import { Team } from '@/context/TeamContext';

const TeamTable: React.FC = () => {
  const { teams, reviewTeam } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const handleReview = async (teamId: string) => {
    await reviewTeam(teamId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'inProgress':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertTriangle className="w-3 h-3 mr-1" /> Unknown</Badge>;
    }
  };

  const handleViewReview = (team: Team) => {
    setSelectedTeam(team);
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-jury-lightGray">
              <TableHead>Team Name</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No teams added yet. Add teams in the Team Management tab.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    <a 
                      href={team.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {team.repoUrl}
                    </a>
                  </TableCell>
                  <TableCell>{getStatusBadge(team.reviewStatus)}</TableCell>
                  <TableCell className="text-right">
                    {team.reviewStatus === 'pending' ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleReview(team.id)}
                        className="bg-jury-accent text-black hover:bg-jury-accent/90"
                      >
                        <Play className="w-4 h-4 mr-1" /> Run Review
                      </Button>
                    ) : team.reviewStatus === 'inProgress' ? (
                      <Button 
                        size="sm" 
                        disabled
                        className="bg-muted text-muted-foreground"
                      >
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewReview(team)}
                      >
                        View Results
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTeam && (
        <TeamReviewDialog 
          team={selectedTeam} 
          open={!!selectedTeam} 
          onClose={() => setSelectedTeam(null)} 
        />
      )}
    </div>
  );
};

export default TeamTable;
