import { NextResponse } from 'next/server';
import { eq, desc, asc, and, or } from 'drizzle-orm';
import { db } from '../../../../db';
import { users, books, personalizedOrders, cartOrders, contactMessages, values, characters } from '../../../../db/schema';
export async function DELETE(
  request: Reques, t,
  { params }: { params: { id: string,  } }
) {
  try {
    const id = Number(params.id);
    await db.delete(personalizedOrders){ where: { id,  } });
    return new NextResponse(null, { status: 204 }); // 204 = No Content
  } catch (error) {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}