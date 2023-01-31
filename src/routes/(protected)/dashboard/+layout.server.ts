import type { LayoutServerLoad } from './$types';
import { PrismaClient, type JournalEntry } from '@prisma/client';
const prisma = new PrismaClient()


export const load = (async ({ locals }) => {
    const { session, user } = await locals.validateUser();
    if (!session) return { error: 401, message: "Unauthorized" };
    if (user) {

        // const post_by_user : JournalEntry[] | null =  await prisma.user.findUnique({
        //     where: {
        //         id: user.userId
        //     }}).JournalEntry();
        const post_by_user: JournalEntry[] | null = await prisma.journalEntry.findMany({
            where: {
                user_id: user.userId,
            },
            include: {
                SharedEntry: true,
            }
        });
        console.log(post_by_user);
        const journal_entries = post_by_user.map(entry => {
            const { SharedEntry, ...rest } = entry;

            if (SharedEntry.length > 0) {
                rest.shared = true;
            } else {
                rest.shared = false;
            }

            return rest
        });
        console.log(journal_entries);

        const habits = await prisma.habit.findMany({
            orderBy: {
                id: 'desc'
            },
            include: {
                HabitEntry: {
                    where: {
                        date: {
                            lte: new Date(),
                            gte: new Date(new Date().setDate(new Date().getDate() - 7))
                        }
                    }
                }
            }
        });

        return {
            entries: journal_entries,
            habits: habits
        };
    }
    return { error: 401, message: "Unauthorized" };
}) satisfies LayoutServerLoad;