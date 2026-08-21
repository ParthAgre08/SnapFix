import React from 'react';
import Hero from '../components/home/Hero';
import QuickActions from '../components/home/QuickActions';
import HowItWorks from '../components/home/HowItWorks';
import ImpactLifecycle from '../components/home/ImpactLifecycle';
import CommunityPreview from '../components/home/CommunityPreview';
import ImpactStats from '../components/home/ImpactStats';
import WhySnapFix from '../components/home/WhySnapFix';
import ReportCTA from '../components/home/ReportCTA';

export default function Home() {
  return (
    <div className="space-y-0">
      <Hero />
      <QuickActions />
      <HowItWorks />
      <ImpactLifecycle />
      <CommunityPreview />
      <ImpactStats />
      <WhySnapFix />
      <ReportCTA />
    </div>
  );
}

     