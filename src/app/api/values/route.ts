// src/app/api/values/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const values = await prisma.value.findMany();
    return NextResponse.json(values);
  } catch (error) {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}