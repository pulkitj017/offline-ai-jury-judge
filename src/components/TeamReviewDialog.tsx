
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

  const overallScore = Object.values(team.scores).reduce((a, b) => a + b, 0) / 6;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-jury-primary text-2xl">Review Results: {team.name}</DialogTitle>
          <DialogDescription>
            Overall Score: <span className="font-bold">{overallScore.toFixed(1)}/10</span>
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreCard 
            title="Relevance" 
            score={team.scores.relevance} 
            explanation={team.explanations.relevance} 
          />
          <ScoreCard 
            title="Performance" 
            score={team.scores.performance} 
            explanation={team.explanations.performance} 
          />
          <ScoreCard 
            title="Security" 
            score={team.scores.security} 
            explanation={team.explanations.security} 
          />
          <ScoreCard 
            title="Cost" 
            score={team.scores.cost} 
            explanation={team.explanations.cost} 
          />
          <ScoreCard 
            title="Vulnerability" 
            score={team.scores.vulnerability} 
            explanation={team.explanations.vulnerability} 
          />
          <ScoreCard 
            title="AI Usage" 
            score={team.scores.aiUsage} 
            explanation={team.explanations.aiUsage} 
          />
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamReviewDialog;
