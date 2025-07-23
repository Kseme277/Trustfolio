import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const guestToken = searchParams.get('guestToken');
  const userId = searchParams.get('userId');

  let where: any = { status: 'IN_CART' };
  if (userId) {
    where.user = { id: userId };
  } else if (guestToken) {
    where.guestToken = guestToken;
  } else {
    return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
  }

  try {
    await prisma.personalizedOrder.deleteMany({ where });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return new NextResponse('Erreur lors de la suppression du panier personnalisé', { status: 500 });
  }
} 