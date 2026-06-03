import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../api/index';

export const trpc = createTRPCReact<AppRouter>();
