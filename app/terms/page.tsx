'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto px-5 py-8 space-y-6"
      style={{ color: 'rgba(255,255,255,0.85)' }}
    >
      <div className="space-y-1">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Terms of Service</h1>
        <p className="font-jetbrains text-[10px] text-white/40 uppercase tracking-widest">Last updated: March 2026</p>
      </div>

      {[
        {
          title: '1. Acceptance of Terms',
          content: `By accessing or using ONE ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.`
        },
        {
          title: '2. Description of Service',
          content: `ONE is a real-time video capture platform that opens a randomized daily capture window. During this window, users may record and share a single unfiltered video moment (3–30 seconds). The platform is designed to preserve authentic human moments without filters or editing.`
        },
        {
          title: '3. User Eligibility',
          content: `You must be at least 13 years of age to use ONE. By using the App, you represent that you meet this requirement. Users under 18 must have parental consent.`
        },
        {
          title: '4. User Conduct',
          content: `You agree not to use ONE to:
• Upload content that is illegal, harmful, threatening, abusive, or harassing.
• Upload content that contains nudity, graphic violence, or explicit material.
• Impersonate any person or entity.
• Upload pre-recorded or filtered content (only live captures are permitted).
• Attempt to manipulate, hack, or disrupt the platform.
• Use automated tools to interact with the App.
Violations may result in immediate account termination.`
        },
        {
          title: '5. Content Ownership and License',
          content: `You retain ownership of the video content you upload. By submitting content to ONE, you grant us a worldwide, non-exclusive, royalty-free license to store, display, and distribute your content within the App and for promotional purposes. This license ends when you delete your content or account.`
        },
        {
          title: '6. Content Moderation',
          content: `ONE uses automated and manual moderation to review content. We reserve the right to remove any content that violates these Terms without prior notice. Users may report inappropriate content using the report function in the App.`
        },
        {
          title: '7. One Capture Per Window',
          content: `Each user is permitted one video capture per daily capture window. This is a core rule of ONE and cannot be circumvented. Attempting to bypass this rule may result in account suspension.`
        },
        {
          title: '8. Disclaimer of Warranties',
          content: `ONE is provided "as is" without warranties of any kind. We do not guarantee that the App will be available at all times, error-free, or free of harmful components. Use of the App is at your own risk.`
        },
        {
          title: '9. Limitation of Liability',
          content: `To the maximum extent permitted by law, ONE and its creators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.`
        },
        {
          title: '10. Termination',
          content: `We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may also delete your account at any time through the App settings.`
        },
        {
          title: '11. Changes to Terms',
          content: `We may update these Terms of Service at any time. Continued use of ONE after changes constitutes acceptance of the updated terms. We will notify users of significant changes through the App.`
        },
        {
          title: '12. Governing Law',
          content: `These Terms are governed by applicable law. Any disputes arising from these Terms or your use of ONE shall be resolved through good-faith negotiation before pursuing legal action.`
        },
        {
          title: '13. Contact',
          content: `For any questions regarding these Terms, please contact us at:\nbahriakyildiz111@gmail.com`
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

export default TermsOfService;
