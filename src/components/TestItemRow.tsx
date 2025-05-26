"use client";

import type { Test } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, CircleEllipsis, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TestItemRowProps {
  test: Test;
}

export function TestItemRow({ test }: TestItemRowProps) {
  const getStatusIcon = () => {
    switch (test.status) {
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "pending":
        return <CircleEllipsis className="h-5 w-5 text-muted-foreground" />;
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "idle":
        return <CircleEllipsis className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="py-3 px-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="font-medium text-sm">{test.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {test.duration !== undefined && (
            <Badge variant="outline" className="text-xs">
              {test.duration}ms
            </Badge>
          )}
          <Badge
            variant={
              test.status === "passed"
                ? "default"
                : test.status === "failed"
                ? "destructive"
                : "secondary"
            }
            className={cn(
              "capitalize text-xs",
              test.status === "passed" && "bg-green-600 hover:bg-green-700 text-white",
            )}
          >
            {test.status}
          </Badge>
        </div>
      </div>
      {test.status === "failed" && test.error && (
         <Accordion type="single" collapsible className="w-full mt-2">
          <AccordionItem value="error-details" className="border-none">
            <AccordionTrigger className="text-xs text-muted-foreground py-1 px-2 hover:no-underline [&[data-state=open]>svg]:text-destructive">Show Error Details</AccordionTrigger>
            <AccordionContent className="mt-1 p-2 bg-destructive/10 rounded-md border border-destructive/30">
              <pre className="text-xs text-destructive font-mono whitespace-pre-wrap">{test.error}</pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
