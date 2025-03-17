import { EgressClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const roomName = req.nextUrl.searchParams.get('roomName');
    if (!roomName) {
      return new NextResponse('Missing roomName parameter', { status: 400 });
    }

    const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

    const hostURL = new URL(LIVEKIT_URL!);
    hostURL.protocol = 'https:';

    const egressClient = new EgressClient(hostURL.origin, LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!);

    const existingEgresses = await egressClient.listEgress({ roomName });
    const activeEgress = existingEgresses.find((e) => e.status < 2);

    if (!activeEgress) {
      return new NextResponse('No active recording found', { status: 404 });
    }

    await egressClient.stopEgress(activeEgress.egressId);

    return new NextResponse('Recording stopped', { status: 200 });
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Internal Server Error', {
      status: 500,
    });
  }
}
