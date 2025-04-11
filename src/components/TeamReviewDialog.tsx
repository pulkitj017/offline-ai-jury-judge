
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Team } from '@/context/TeamContext';

interface TeamReviewDialogProps {
  team: Team;
  open: boolean;
  onClose: () => void;
}

const ScoreCard = ({ 
  title, 
  score, 
  explanation 
}: { 
  title: string; 
  score: number; 
  explanation: string 
}) => {
  // Determine color based on score
  const getProgressColor = (score: number) => {
    if (score <= 3) return 'bg-red-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex justify-between items-center">
          <CardDescription>{score}/10</CardDescription>
          <Progress 
            value={score * 10} 
            className={`w-2/3 h-2 ${getProgressColor(score)}`} 
          />
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {explanation}
      </CardContent>
    </Card>
  );
};

const TeamReviewDialog: React.FC<TeamReviewDialogProps> = ({ team, open, onClose }) => {
  if (!team.scores || !team.explanations) {
    return null;
  }

  // Use the total score provided by the LLM, or calculate it if not available
  const totalScore = team.scores.total || 
    Math.round(Object.entries(team.scores)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [_, value]) => sum + value, 0) * 2.5);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-jury-primary text-2xl">Review Results: {team.name}</DialogTitle>
          <DialogDescription>
            Overall Score: <span className="font-bold">{totalScore}/100</span>
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreCard 
            title="AI Contribution" 
            score={team.scores.aiContribution} 
            explanation={team.explanations.aiContribution} 
          />
          <ScoreCard 
            title="Security & Access" 
            score={team.scores.security} 
            explanation={team.explanations.security} 
          />
          <ScoreCard 
            title="Scalability & Availability" 
            score={team.scores.scalability} 
            explanation={team.explanations.scalability} 
          />
          <ScoreCard 
            title="Architecture" 
            score={team.scores.architecture} 
            explanation={team.explanations.architecture} 
          />
          <ScoreCard 
            title="Cost Optimization" 
            score={team.scores.costOptimization} 
            explanation={team.explanations.costOptimization} 
          />
        </div>
        
        <Separator className="my-4" />
        
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            {team.explanations.applicationStatus}
          </CardContent>
        </Card>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamReviewDialog;
