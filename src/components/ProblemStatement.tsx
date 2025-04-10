
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTeams } from '@/context/TeamContext';
import { FileText } from 'lucide-react';

interface ProblemStatementProps {
  onComplete: () => void;
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({ onComplete }) => {
  const { problemStatement, setProblemStatement } = useTeams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problemStatement.trim()) {
      onComplete();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-jury-primary" />
          <CardTitle>Problem Statement</CardTitle>
        </div>
        <CardDescription>
          Enter the common problem statement that applies to all teams.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Enter the problem statement here..."
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            className="min-h-[200px]"
            required
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-jury-accent text-black hover:bg-jury-accent/90"
            disabled={!problemStatement.trim()}
          >
            Continue to Team Management
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProblemStatement;
