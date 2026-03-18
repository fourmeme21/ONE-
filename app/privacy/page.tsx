'use client';

import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto px-5 py-8 space-y-6"
      style={{ color: 'rgba(255,255,255,0.85)' }}
    >
      <div className="space-y-1">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Privacy Policy</h1>
        <p className="font-jetbrains text-[10px] text-white/40 uppercase tracking-widest">Last updated: March 2026</p>
      </div>

      {[
        {
          title: '1. Information We Collect',
          content: `ONE collects the following information when you use our app:
• Account information: your name and email address provided through Google Sign-In.
• Location data: your approximate city and country, obtained via GPS or IP address, to tag your captured moments.
• Video content: short video clips (3–30 seconds) you choose to record and submit during an active capture window.
• Usage data: timestamps of captures, reactions you give or receive, and your activity streak.`
        },
        {
          title: '2. How We Use Your Information',
          content: `We use your information to:
• Display your location on your profile and on captured moments in the global feed.
• Associate your moments with the correct daily capture window.
• Calculate your streak and reaction counts.
• Enforce the one-capture-per-window rule.
We do not sell your personal data to any third parties.`
        },
        {
          title: '3. Anonymous Mode',
          content: `When Ghost Mode is enabled, only your city is shown on your moments — your name and profile details are hidden from other users. You can toggle Ghost Mode at any time from your profile settings.`
        },
        {
          title: '4. Data Storage',
          content: `Your data is stored securely on Supabase (PostgreSQL database) and Backblaze B2 (video storage), both of which use industry-standard encryption at rest and in transit. Videos are stored with a unique identifier and are not linked to your personal identity in public-facing URLs.`
        },
        {
          title: '5. Data Retention',
          content: `Your video moments are retained indefinitely as part of the collective archive — this is core to ONE's mission of preserving authentic human moments. You may request deletion of your account and all associated data by contacting us at the email below.`
        },
        {
          title: '6. Third-Party Services',
          content: `ONE uses the following third-party services:
• Google Sign-In (authentication)
• Supabase (database and backend)
• Backblaze B2 (video storage)
• OpenStreetMap Nominatim (reverse geocoding)
• ipapi.co (IP-based location fallback)
Each service has its own privacy policy governing their data practices.`
        },
        {
          title: '7. Children\'s Privacy',
          content: `ONE is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.`
        },
        {
          title: '8. Your Rights',
          content: `You have the right to:
• Access the personal data we hold about you.
• Request correction of inaccurate data.
• Request deletion of your account and data.
• Withdraw consent at any time by deleting your account.
To exercise these rights, contact us at: bahriakyildiz111@gmail.com`
        },
        {
          title: '9. Changes to This Policy',
          content: `We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. Continued use of ONE after changes constitutes acceptance of the updated policy.`
        },
        {
          title: '10. Contact',
          content: `For any privacy-related questions or requests, please contact us at:\nbahriakyildiz111@gmail.com`
        },
      ].map((section, i) => (
        <div key={i} className="space-y-2">
          <h2 className="font-jetbrains text-sm font-bold text-[var(--accent-electric)] uppercase tracking-wider">{section.title}</h2>
          <p className="font-dm-sans text-sm text-white/70 leading-relaxed whitespace-pre-line">{section.content}</p>
        </div>
      ))}

      <div className="pt-4 border-t border-white/10 text-center">
        <p className="font-jetbrains text-[10px] text-white/30 uppercase tracking-widest">one20.netlify.app — The world. Right now. Unfiltered.</p>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
