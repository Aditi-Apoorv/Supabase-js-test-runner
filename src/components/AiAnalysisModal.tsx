"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface AiAnalysisModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  analysis: string | null;
  isLoading: boolean;
}

export function AiAnalysisModal({
  isOpen,
  onOpenChange,
  analysis,
  isLoading,
}: AiAnalysisModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>AI Failure Analysis</DialogTitle>
          <DialogDescription>
            Suggested causes for frequently failed tests, powered by AI.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] p-1">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-lg">Analyzing failures...</p>
            </div>
          )}
          {!isLoading && analysis && (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border p-4 bg-muted/50">
              {analysis}
            </div>
          )}
          {!isLoading && !analysis && (
            <p className="text-center text-muted-foreground">
              No analysis results to display. This may be due to no failures or an issue with the analysis.
            </p>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
