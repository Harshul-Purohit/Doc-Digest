import { connectToDatabase } from '@/lib/db';
import { Summary } from '@/models/Summary';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return Response.json(
        { error: 'Authentication required to view summary history.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const summaries = await Summary.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = summaries.map((doc) => ({
      id: String(doc._id),
      url: doc.url,
      title: doc.title,
      summary: doc.summary,
      createdAt: doc.createdAt,
    }));

    return Response.json({ summaries: formatted });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch history.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
