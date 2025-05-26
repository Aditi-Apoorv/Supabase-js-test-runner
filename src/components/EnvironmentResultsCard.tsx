"use client";

import type { EnvironmentTestData, TestSuite } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TestItemRow } from "./TestItemRow";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, CircleEllipsis, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnvironmentResultsCardProps {
  envTestData: EnvironmentTestData;
}

export function EnvironmentResultsCard({ envTestData }: EnvironmentResultsCardProps) {
  const { Icon, name, summary, suites, overallStatus } = envTestData;

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
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
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">{name}</CardTitle>
          </div>
          <Badge
            variant={
              overallStatus === "passed"
                ? "default"
                : overallStatus === "failed"
                ? "destructive"
                : "secondary"
            }
            className={cn(
              "capitalize text-sm px-3 py-1",
               overallStatus === "passed" && "bg-green-600 hover:bg-green-700 text-white",
            )}
          >
            {getOverallStatusIcon()}
            <span className="ml-2">{overallStatus}</span>
          </Badge>
        </div>
        <CardDescription className="mt-1 text-sm">
          Passed: {summary.passed}, Failed: {summary.failed}, Pending: {summary.pending}, Running: {summary.running}, Total: {summary.total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suites.length > 0 ? (
          <Accordion type="multiple" className="w-full" defaultValue={suites.map(s => s.id)}>
            {suites.map((suite: TestSuite) => (
              <AccordionItem value={suite.id} key={suite.id} className="mb-2 border bg-muted/20 rounded-md">
                <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
                  {suite.name}
                </AccordionTrigger>
                <AccordionContent className="pt-0">
                  <div className="bg-background rounded-b-md">
                    {suite.tests.map((test) => (
                      <TestItemRow key={test.id} test={test} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
           <p className="text-center text-muted-foreground py-4">No test suites for this environment.</p>
        )}
      </CardContent>
    </Card>
  );
}
