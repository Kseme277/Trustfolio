import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await prisma.personalizedOrder.delete({ where: { id } });
    return new NextResponse(null, { status: 204 }); // 204 = No Content
  } catch (error) {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}