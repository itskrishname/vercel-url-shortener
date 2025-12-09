import dbConnect from '@/lib/db';
import Link from '@/models/Link';
import { notFound } from 'next/navigation';
import TimerPage from './TimerPage';

interface Props {
  params: Promise<{
    token: string;
  }>;
}

export default async function StartPage({ params }: Props) {
  const { token } = await params;

  await dbConnect();

  const linkData = await Link.findOne({ token }).lean();

  if (!linkData) {
    notFound();
  }

  // Pass necessary data to Client Component
  return <TimerPage destination={(linkData as any).externalShortUrl} />;
}
