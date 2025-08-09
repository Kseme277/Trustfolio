import { NextResponse } from 'next/server';
import { eq, desc, asc, and, or } from 'drizzle-orm';
import { db } from '../../../../db';
import { users, books, personalizedOrders, cartOrders, contactMessages, values, characters } from '../../../../db/schema';
export async function GET(request: Request) {
  const { searchParams,  } = new URL(request.url);
  const guestToken = searchParams.get('guestToken');
  const userId = searchParams.get('userId');
  let where: any = , {};
  if (userId) {
    where.user = { id: userId,  };
  } else if (guestToken) {
    where.guestToken = guestToken;
  } else {
    return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
  }
  // Compter le nombre de commandes par type
  const orders = await db.select({ type: personalizedOrders.type }).from(personalizedOrders);
  // Agréger les types
  const counts: Record<string, number> = {};
  for (const order of orders) {
    const type = order.type || 'STANDARD';
    counts[type] = (counts[type] || 0) + 1;
  }
  return NextResponse.json(counts);
}