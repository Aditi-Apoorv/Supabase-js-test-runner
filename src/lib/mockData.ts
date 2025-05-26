import type { TestSuite, TestStatus, EnvironmentId } from '@/lib/types';
import { ENVIRONMENTS_CONFIG } from '@/lib/constants';

const createSampleTests = (suitePrefix: string, count: number): TestSuite[] => {
  const suites: TestSuite[] = [];
  for (let i = 1; i <= 2; i++) { // 2 suites per environment
    const tests = [];
    for (let j = 1; j <= count; j++) { // 'count' tests per suite
      tests.push({
        id: `${suitePrefix}-suite${i}-test${j}`,
        name: `Test Case ${j} for Suite ${i}`,
        status: 'idle' as TestStatus,
      });
    }
    suites.push({
      id: `${suitePrefix}-suite${i}`,
      name: `Sample Test Suite ${i}`,
      tests,
    });
  }
  return suites;
};

export const MOCK_TEST_DATA_PER_ENV: Record<EnvironmentId, TestSuite[]> = ENVIRONMENTS_CONFIG.reduce((acc, envConfig) => {
  acc[envConfig.id] = createSampleTests(envConfig.id, 5); // 5 tests per suite
  return acc;
}, {} as Record<EnvironmentId, TestSuite[]>);

