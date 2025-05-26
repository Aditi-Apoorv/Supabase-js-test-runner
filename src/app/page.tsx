"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AiAnalysisModal } from "@/components/AiAnalysisModal";
import { EnvironmentResultsCard } from "@/components/EnvironmentResultsCard";
import type { EnvironmentId, Test, TestSuite, EnvironmentTestData, TestStatus } from "@/lib/types";
import { ENVIRONMENTS_CONFIG } from "@/lib/constants";
import { MOCK_TEST_DATA_PER_ENV } from "@/lib/mockData";
import { analyzeTestFailures, type AnalyzeTestFailuresInput } from "@/ai/flows/analyze-test-failures";
import { Boxes, Play, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [selectedEnvironments, setSelectedEnvironments] = useState<Set<EnvironmentId>>(
    new Set(ENVIRONMENTS_CONFIG.map(env => env.id))
  );
  const [testData, setTestData] = useState<EnvironmentTestData[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExecutingTests, setIsExecutingTests] = useState(false);
  const { toast } = useToast();

  const calculateSummaryAndStatus = (suites: TestSuite[]): EnvironmentTestData['summary'] & { overallStatus: TestStatus } => {
    let passed = 0, failed = 0, pending = 0, running = 0, total = 0;
    suites.forEach(suite => {
      suite.tests.forEach(test => {
        total++;
        if (test.status === 'passed') passed++;
        else if (test.status === 'failed') failed++;
        else if (test.status === 'pending' || test.status === 'idle') pending++;
        else if (test.status === 'running') running++;
      });
    });

    let overallStatus: TestStatus = 'idle';
    if (running > 0) overallStatus = 'running';
    else if (failed > 0) overallStatus = 'failed';
    else if (pending > 0 && passed + failed < total) overallStatus = 'pending';
    else if (total > 0 && passed === total) overallStatus = 'passed';
    else if (total === 0) overallStatus = 'idle';


    return { summary: { passed, failed, pending, running, total }, overallStatus };
  };

  const initializeTestData = useCallback(() => {
    const initialData = ENVIRONMENTS_CONFIG.map(envConfig => {
      const suitesForEnv = MOCK_TEST_DATA_PER_ENV[envConfig.id].map(suite => ({
        ...suite,
        tests: suite.tests.map(test => ({ ...test, status: 'idle' as TestStatus }))
      }));
      const { summary, overallStatus } = calculateSummaryAndStatus(suitesForEnv);
      return {
        id: envConfig.id,
        name: envConfig.name,
        Icon: envConfig.Icon,
        suites: suitesForEnv,
        summary,
        overallStatus,
      };
    });
    setTestData(initialData);
  }, []);

  useEffect(() => {
    initializeTestData();
  }, [initializeTestData]);

  const handleEnvironmentToggle = (envId: EnvironmentId) => {
    setSelectedEnvironments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(envId)) {
        newSet.delete(envId);
      } else {
        newSet.add(envId);
      }
      return newSet;
    });
  };

  const runTests = async () => {
    if (selectedEnvironments.size === 0) {
      toast({
        title: "No Environments Selected",
        description: "Please select at least one environment to run tests.",
        variant: "destructive",
      });
      return;
    }
    setIsExecutingTests(true);

    // Update status to 'running' for selected environments
    setTestData(prevData =>
      prevData.map(envData => {
        if (selectedEnvironments.has(envData.id)) {
          const updatedSuites = envData.suites.map(suite => ({
            ...suite,
            tests: suite.tests.map(test => ({ ...test, status: 'running' as TestStatus, duration: undefined, error: undefined })),
          }));
          const { summary, overallStatus } = calculateSummaryAndStatus(updatedSuites);
          return { ...envData, suites: updatedSuites, summary, overallStatus };
        }
        return envData;
      })
    );

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1500)); // Initial delay

    const updatedTestDataPromises = testData.map(async (envData) => {
      if (!selectedEnvironments.has(envData.id)) {
        return envData; // Skip non-selected environments
      }

      const newSuites = envData.suites.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => {
          // Simulate individual test delay
          return new Promise<Test>(resolveTest => {
            setTimeout(() => {
              const randomStatus = Math.random();
              let status: TestStatus;
              let error: string | undefined = undefined;
              if (randomStatus < 0.7) status = 'passed'; // 70% pass
              else if (randomStatus < 0.9) { // 20% fail
                status = 'failed';
                error = `Error: Assertion failed in ${test.name}. Expected 'foo' but got 'bar'.\nStack trace:\n  at /path/to/test/file.js:123:45\n  at AnotherFunction (/path/to/another/file.js:67:89)`;
              }
              else status = 'pending'; // 10% pending (or treat as pass/fail eventually)
              
              resolveTest({
                ...test,
                status,
                duration: Math.floor(Math.random() * 500) + 50, // Random duration 50-550ms
                error,
              });
            }, Math.random() * 1000); // Stagger test completion
          });
        }),
      }));
      
      const resolvedTestsPromises = newSuites.map(async suite => ({
        ...suite,
        tests: await Promise.all(suite.tests as unknown as Promise<Test>[]) // Cast needed due to mixed promise/object structure initially
      }));
      
      const fullyResolvedSuites = await Promise.all(resolvedTestsPromises);
      const { summary, overallStatus } = calculateSummaryAndStatus(fullyResolvedSuites);
      return { ...envData, suites: fullyResolvedSuites, summary, overallStatus };
    });

    const finalTestData = await Promise.all(updatedTestDataPromises);
    setTestData(finalTestData);
    setIsExecutingTests(false);
    toast({
        title: "Test Execution Complete",
        description: "Review the results below.",
    });
  };

  const handleAnalyzeFailures = async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiAnalysis(null);

    const failedTestsInfo: string[] = [];
    testData.forEach(env => {
      if (selectedEnvironments.has(env.id)) {
        env.suites.forEach(suite => {
          suite.tests.forEach(test => {
            if (test.status === 'failed') {
              failedTestsInfo.push(`Environment: ${env.name}\nSuite: ${suite.name}\nTest: ${test.name}\nError: ${test.error || 'N/A'}`);
            }
          });
        });
      }
    });

    if (failedTestsInfo.length === 0) {
      setAiAnalysis("No failed tests found to analyze.");
      setIsAiLoading(false);
      return;
    }

    const input: AnalyzeTestFailuresInput = {
      testResults: failedTestsInfo.join("\n\n---\n\n"),
    };

    try {
      const result = await analyzeTestFailures(input);
      setAiAnalysis(result.suggestedCauses);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("An error occurred during AI analysis. Please check the console.");
       toast({
        title: "AI Analysis Failed",
        description: "Could not get suggestions from AI.",
        variant: "destructive",
      });
    }
    setIsAiLoading(false);
  };

  const hasFailedTests = testData.some(env => 
    selectedEnvironments.has(env.id) && env.summary.failed > 0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 border-b border-border shadow-sm bg-card">
        <div className="container mx-auto flex items-center gap-3">
          <Boxes className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">MultiVerse Test Runner</h1>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Test Configuration</CardTitle>
            <CardDescription>Select environments and run your test suites.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Environments:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ENVIRONMENTS_CONFIG.map(envConfig => (
                  <div key={envConfig.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={envConfig.id}
                      checked={selectedEnvironments.has(envConfig.id)}
                      onCheckedChange={() => handleEnvironmentToggle(envConfig.id)}
                      aria-label={`Select ${envConfig.name}`}
                    />
                    <envConfig.Icon className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor={envConfig.id} className="text-sm font-medium cursor-pointer">
                      {envConfig.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={runTests} disabled={isExecutingTests} className="w-full sm:w-auto">
                {isExecutingTests ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isExecutingTests ? "Running Tests..." : "Run Tests"}
              </Button>
              <Button
                variant="outline"
                onClick={handleAnalyzeFailures}
                disabled={!hasFailedTests || isExecutingTests || isAiLoading}
                className="w-full sm:w-auto"
              >
                <Brain className="mr-2 h-4 w-4" />
                Analyze Failures
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {testData.filter(env => selectedEnvironments.has(env.id)).length > 0 ? (
            testData
              .filter(env => selectedEnvironments.has(env.id))
              .map(envData => (
                <EnvironmentResultsCard key={envData.id} envTestData={envData} />
              ))
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-10 text-center">
                <p className="text-muted-foreground text-lg">
                  {selectedEnvironments.size === 0 
                    ? "Select environments and click 'Run Tests' to see results."
                    : "No results to display for the selected environments yet. Click 'Run Tests'."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        analysis={aiAnalysis}
        isLoading={isAiLoading}
      />
      
      <footer className="py-6 px-4 md:px-8 border-t border-border mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MultiVerse Test Runner. Empowering robust isomorphic JavaScript testing.
          </p>
      </footer>
    </div>
  );
}
