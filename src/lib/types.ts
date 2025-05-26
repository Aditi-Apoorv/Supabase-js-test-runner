import type { LucideIcon } from 'lucide-react';

export type EnvironmentId = 'electron' | 'react-native' | 'node' | 'browser';
export type TestStatus = 'passed' | 'failed' | 'pending' | 'running' | 'idle';

export interface Test {
  id: string;
  name: string;
  status: TestStatus;
  duration?: number; // in ms
  error?: string; // if failed
}

export interface TestSuite {
  id: string;
  name: string;
  tests: Test[];
}

export interface EnvironmentConfig {
  id: EnvironmentId;
  name: string;
  Icon: LucideIcon;
}

export interface EnvironmentTestData {
  id: EnvironmentId; // Matches EnvironmentConfig.id
  name: string;
  Icon: LucideIcon;
  suites: TestSuite[];
  overallStatus: TestStatus;
  summary: {
    passed: number;
    failed: number;
    pending: number;
    running: number;
    total: number;
  };
}
