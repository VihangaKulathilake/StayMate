import React from 'react';
import LandingNavbar from '../../components/common/LandingNavbar';
import HeroSection from '../../components/landing/HeroSection';
import StatsSection from '../../components/landing/StatsSection';
import FeaturedBoardingsSection from '../../components/landing/FeaturedBoardingsSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import BenefitsSection from '../../components/landing/BenefitsSection';
import CTASection from '../../components/landing/CTASection';

export default function LandingPage() {
    return (
        <div className="landing-page font-sans bg-white min-h-screen flex flex-col">
            <LandingNavbar />
            <main className="flex-1">
                <HeroSection />
                <StatsSection />
                <FeaturedBoardingsSection />
                <FeaturesSection />
                <HowItWorksSection />
                <BenefitsSection />
                <CTASection />
            </main>
        </div>
    );
}

