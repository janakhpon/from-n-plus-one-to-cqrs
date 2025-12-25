import { NextResponse } from 'next/server';
import { runFullProjection } from '@/jobs/projection-full';

export async function POST() {
  try {
    await runFullProjection();
    return NextResponse.json({
      success: true,
      message: 'projection completed',
    });
  } catch (error) {
    console.error('projection error', error);
    return NextResponse.json(
      { success: false, error: 'projection failed' },
      { status: 500 },
    );
  }
}
