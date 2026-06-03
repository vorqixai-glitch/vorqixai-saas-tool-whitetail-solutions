import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';
import { db } from './queries/connection';
import { localUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.APP_SECRET || 'super-secret-white-tail-key-123';

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  let user = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string, role: string };
      const users = await db.select().from(localUsers).where(eq(localUsers.id, decoded.id)).limit(1);
      if (users.length > 0) {
        user = users[0];
      }
    } catch (err) {
      // invalid token
    }
  }
  return { req, res, user };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  });
});
