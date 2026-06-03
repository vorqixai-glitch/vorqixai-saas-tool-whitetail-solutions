import { z } from 'zod';
import { router, publicProcedure, authedProcedure } from './trpc';
import { db } from './queries/connection';
import { localUsers, organizations, residents, licenseApplications, documents, complianceItems, consultingBookings, messages, licenseDocuments } from '../db/schema';
import { eq, and, or, sql, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.APP_SECRET || 'super-secret-white-tail-key-123';

const authRouter = router({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6), name: z.string(), role: z.enum(['user', 'admin']).optional().default('user') }))
    .mutation(async ({ input }) => {
      const existing = await db.select().from(localUsers).where(eq(localUsers.email, input.email));
      if (existing.length > 0) throw new Error('Email already exists');
      const hash = await bcrypt.hash(input.password, 10);
      const res = await db.insert(localUsers).values({ email: input.email, passwordHash: hash, name: input.name, role: input.role }).returning();
      const user = res[0];
      
      if (user.role === 'user') {
        await db.insert(organizations).values({ 
          name: `${input.name}'s Organization`, 
          slug: `${input.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}`, 
          ownerId: 1, 
          localOwnerId: user.id 
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const users = await db.select().from(localUsers).where(eq(localUsers.email, input.email));
      if (users.length === 0) throw new Error('Invalid credentials');
      const user = users[0];
      const isValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValid) throw new Error('Invalid credentials');
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }),
  me: authedProcedure.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role
    };
  })
});

const orgRouter = router({
  myOrg: authedProcedure.query(async ({ ctx }) => {
    const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
    return orgs[0] || null;
  }),
  createOrUpdate: authedProcedure
    .input(z.object({ name: z.string(), phone: z.string().optional(), address: z.string().optional(), city: z.string().optional(), state: z.string().optional(), zip: z.string().optional(), beds: z.number().optional(), narLevel: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
      if (orgs.length > 0) {
        return db.update(organizations).set({ ...input, updatedAt: new Date().toISOString() }).where(eq(organizations.id, orgs[0].id)).returning();
      } else {
        return db.insert(organizations).values({ ...input, slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), ownerId: 1, localOwnerId: ctx.user.id }).returning();
      }
    })
});

const dashboardRouter = router({
  stats: authedProcedure.query(async ({ ctx }) => {
    const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
    if (!orgs[0]) return { residents: 0, complianceItems: 0, licenses: 0, documents: 0 };
    const orgId = orgs[0].id;
    
    // Naively counting
    const resCount = await db.select({ count: sql<number>`count(*)` }).from(residents).where(eq(residents.orgId, orgId));
    const compCount = await db.select({ count: sql<number>`count(*)` }).from(complianceItems).where(eq(complianceItems.orgId, orgId));
    const licCount = await db.select({ count: sql<number>`count(*)` }).from(licenseApplications).where(eq(licenseApplications.orgId, orgId));
    const docCount = await db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.orgId, orgId));

    return {
      residents: resCount[0].count,
      complianceItems: compCount[0].count,
      licenses: licCount[0].count,
      documents: docCount[0].count
    };
  })
});

const residentsRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
    if (!orgs[0]) return [];
    return db.select().from(residents).where(eq(residents.orgId, orgs[0].id));
  }),
  create: authedProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string(), email: z.string().optional(), phone: z.string().optional(), roomNumber: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
      if (!orgs[0]) throw new Error('No org');
      return db.insert(residents).values({ ...input, orgId: orgs[0].id }).returning();
    }),
  updateStatus: authedProcedure
    .input(z.object({ id: z.number(), backgroundCheckStatus: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return db.update(residents).set({ backgroundCheckStatus: input.backgroundCheckStatus }).where(eq(residents.id, input.id)).returning();
    })
});

const documentsRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
    if (!orgs[0]) return [];
    return db.select().from(documents).where(eq(documents.orgId, orgs[0].id));
  }),
  create: authedProcedure
    .input(z.object({ title: z.string(), content: z.string(), category: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
      if (!orgs[0]) throw new Error('No org');
      return db.insert(documents).values({ ...input, orgId: orgs[0].id }).returning();
    }),
  sign: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return db.update(documents).set({ signed: 'yes', signedAt: new Date().toISOString() }).where(eq(documents.id, input.id)).returning();
    }),
});

const complianceRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
    if (!orgs[0]) return [];
    return db.select().from(complianceItems).where(eq(complianceItems.orgId, orgs[0].id));
  }),
  create: authedProcedure
    .input(z.object({ title: z.string(), category: z.string().optional(), priority: z.string().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
      if (!orgs[0]) throw new Error('No org');
      return db.insert(complianceItems).values({ ...input, orgId: orgs[0].id }).returning();
    }),
  updateStatus: authedProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return db.update(complianceItems).set({ status: input.status }).where(eq(complianceItems.id, input.id)).returning();
    }),
});

const licensingRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
    if (!orgs[0]) return [];
    return db.select().from(licenseApplications).where(eq(licenseApplications.orgId, orgs[0].id));
  }),
  create: authedProcedure
    .input(z.object({ state: z.string(), stateCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
      if (!orgs[0]) throw new Error('No org');
      return db.insert(licenseApplications).values({ ...input, orgId: orgs[0].id }).returning();
    }),
  getDocs: authedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(licenseDocuments).where(eq(licenseDocuments.applicationId, input.applicationId));
    }),
  uploadDoc: authedProcedure
    .input(z.object({ applicationId: z.number(), fileName: z.string(), fileData: z.string() }))
    .mutation(async ({ input }) => {
      return db.insert(licenseDocuments).values({ applicationId: input.applicationId, fileName: input.fileName, fileData: input.fileData }).returning();
    }),
  efile: authedProcedure
    .input(z.object({ applicationId: z.number() }))
    .mutation(async ({ input }) => {
      return db.update(licenseApplications).set({ status: 'submitted', submissionDate: new Date().toISOString() }).where(eq(licenseApplications.id, input.applicationId)).returning();
    })
});

const consultingRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
    if (!orgs[0]) return [];
    return db.select().from(consultingBookings).where(eq(consultingBookings.orgId, orgs[0].id));
  }),
  create: authedProcedure
    .input(z.object({ topic: z.string(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const orgs = await db.select().from(organizations).where(eq(organizations.localOwnerId, ctx.user.id)).limit(1);
      if (!orgs[0]) throw new Error('No org');
      return db.insert(consultingBookings).values({ ...input, orgId: orgs[0].id, userId: ctx.user.id }).returning();
    })
});

const adminRouter = router({
  getClients: authedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
    return db.select().from(organizations);
  }),
  getClientStats: authedProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const resCount = await db.select({ count: sql<number>`count(*)` }).from(residents).where(eq(residents.orgId, input.orgId));
      const compCount = await db.select({ count: sql<number>`count(*)` }).from(complianceItems).where(eq(complianceItems.orgId, input.orgId));
      const docCount = await db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.orgId, input.orgId));
      return {
        residents: resCount[0].count,
        complianceItems: compCount[0].count,
        documents: docCount[0].count
      };
    }),
  getClientData: authedProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const res = await db.select().from(residents).where(eq(residents.orgId, input.orgId));
      const comp = await db.select().from(complianceItems).where(eq(complianceItems.orgId, input.orgId));
      const docs = await db.select().from(documents).where(eq(documents.orgId, input.orgId));
      const apps = await db.select().from(licenseApplications).where(eq(licenseApplications.orgId, input.orgId));
      return { residents: res, complianceItems: comp, documents: docs, licenseApplications: apps };
    })
});

const messagesRouter = router({
  list: authedProcedure
    .input(z.object({ otherUserId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      let conditions = [];
      if (input.otherUserId) {
         conditions.push(or(
           and(eq(messages.senderId, ctx.user.id), eq(messages.receiverId, input.otherUserId)),
           and(eq(messages.senderId, input.otherUserId), eq(messages.receiverId, ctx.user.id))
         ));
      } else {
         conditions.push(or(eq(messages.senderId, ctx.user.id), eq(messages.receiverId, ctx.user.id)));
      }
      return db.select().from(messages).where(conditions[0]!).orderBy(desc(messages.id));
    }),
  send: authedProcedure
    .input(z.object({ receiverId: z.number(), text: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let finalReceiverId = input.receiverId;
      if (finalReceiverId === -1) {
        const admins = await db.select().from(localUsers).where(eq(localUsers.role, 'admin')).limit(1);
        if (admins.length > 0) finalReceiverId = admins[0].id;
        else finalReceiverId = 1; // fallback
      }
      return db.insert(messages).values({ senderId: ctx.user.id, receiverId: finalReceiverId, text: input.text }).returning();
    })
});

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const aiRouter = router({
  chat: authedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: input.message,
        });
        return { reply: response.text || "Hello! I received your message." };
      } catch (err) {
        return { reply: "I'm having trouble connecting to my systems right now. How else can I help?" };
      }
    }),
  extractLease: authedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const prompt = `Extract the following information from the text and return it as JSON: { "firstName": "string", "lastName": "string", "rentAmount": "number", "dueDate": "string" }. text: ${input.text}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config: {
             responseMimeType: 'application/json'
          }
        });
        const parsed = JSON.parse(response.text || '{}');
        return parsed;
      } catch (err) {
        return { error: 'Failed to extract data' };
      }
    })
});

export const appRouter = router({
  ping: publicProcedure.query(() => ({ ok: true })),
  auth: authRouter,
  org: orgRouter,
  dashboard: dashboardRouter,
  residents: residentsRouter,
  documents: documentsRouter,
  compliance: complianceRouter,
  licensing: licensingRouter,
  consulting: consultingRouter,
  admin: adminRouter,
  messages: messagesRouter,
  ai: aiRouter
});

export type AppRouter = typeof appRouter;
