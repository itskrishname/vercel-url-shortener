import { NextRequest, NextResponse } from 'next/server';
import { GET as ShortenGET } from './shorten/route';

// Redirect /api requests to /api/shorten logic
// We just re-export the GET handler
export const GET = ShortenGET;
