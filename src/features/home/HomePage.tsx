import { HeroSection } from './HeroSection';
import { ArchitectureSection } from './ArchitectureSection';
import { FeatureShowcase } from './FeatureShowcase';
import { DataFlowSection } from './DataFlowSection';
import { EncryptionSection } from './EncryptionSection';
import { TeamSection } from './TeamSection';

export function HomePage() {
  return (
    <>
      {/* Hero Section + Stats Marquee */}
      <HeroSection />

      {/* Architecture Overview */}
      <ArchitectureSection />

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Data Flow Diagram */}
      <DataFlowSection />

      {/* The Request Journey — TLS Encryption */}
      <EncryptionSection />

      {/* About / Team */}
      <TeamSection />
    </>
  );
}
