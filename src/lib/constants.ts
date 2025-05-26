import type { EnvironmentConfig } from '@/lib/types';
import { Laptop, Smartphone, Server, Globe } from 'lucide-react';

export const ENVIRONMENTS_CONFIG: EnvironmentConfig[] = [
  { id: 'electron', name: 'Electron.js', Icon: Laptop },
  { id: 'react-native', name: 'React Native', Icon: Smartphone },
  { id: 'node', name: 'Node.js (Server)', Icon: Server },
  { id: 'browser', name: 'Browser (Client)', Icon: Globe },
];
