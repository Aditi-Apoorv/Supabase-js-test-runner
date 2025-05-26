import type { TestSuite, TestStatus, EnvironmentId } from '@/lib/types';
import { ENVIRONMENTS_CONFIG } from '@/lib/constants';

const supabaseCommonTests = [
  { id: 'client-init', name: 'Successfully initializes Supabase client' },
  { id: 'auth-signup', name: 'Auth: Attempts user sign-up' },
  { id: 'auth-signin', name: 'Auth: Attempts user sign-in' },
  { id: 'auth-signout', name: 'Auth: Attempts user sign-out' },
  { id: 'db-insert', name: 'Database: Inserts a new record' },
  { id: 'db-select', name: 'Database: Queries for records' },
  { id: 'db-update', name: 'Database: Updates a record' },
  { id: 'db-delete', name: 'Database: Deletes a record' },
  { id: 'storage-upload', name: 'Storage: Uploads a file' },
  { id: 'storage-download', name: 'Storage: Downloads a file' },
  { id: 'functions-invoke', name: 'Functions: Invokes an edge function' },
];

const createSampleSupabaseTests = (envPrefix: string): TestSuite[] => {
  const suites: TestSuite[] = [
    {
      id: `${envPrefix}-supabase-core-suite`,
      name: 'Supabase Core Functionality',
      tests: supabaseCommonTests.slice(0, 5).map(test => ({ // Take first 5 for this suite
        id: `${envPrefix}-${test.id}`,
        name: test.name,
        status: 'idle' as TestStatus,
      })),
    },
    {
      id: `${envPrefix}-supabase-advanced-suite`,
      name: 'Supabase Advanced Operations',
      tests: supabaseCommonTests.slice(5).map(test => ({ // Take the rest for this suite
        id: `${envPrefix}-${test.id}`,
        name: test.name,
        status: 'idle' as TestStatus,
      })),
    }
  ];
  return suites;
};

export const MOCK_TEST_DATA_PER_ENV: Record<EnvironmentId, TestSuite[]> = ENVIRONMENTS_CONFIG.reduce((acc, envConfig) => {
  acc[envConfig.id] = createSampleSupabaseTests(envConfig.id);
  return acc;
}, {} as Record<EnvironmentId, TestSuite[]>);
