import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';

export default function Terms() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Joyn OS — Terms of Service (Draft)</Text>
        <Text style={styles.updated}>Last updated: August 8, 2025</Text>

        <Text style={styles.h2}>1) Who we are and how to contact us</Text>
        <Text style={styles.p}>Joyn OS, Inc. ("Joyn OS," "we," "us," or "our") offers a mobile platform that converts a user’s “I’m free now” intent into safe, real‑world micro‑hangouts using AI matching, short commitment windows, and optional reservations ("Services").{"\n\n"}Contact: [insert legal name & address] • [insert support email]</Text>

        <Text style={styles.h2}>2) Acceptance of these Terms</Text>
        <Text style={styles.p}>By creating an account, accessing, or using the Services, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Services. We may update these Terms from time to time and will notify you in‑app or by email; your continued use means you accept the changes.</Text>

        <Text style={styles.h2}>3) Eligibility & account rules</Text>
        <Text style={styles.p}>Age. You must be 18 or older. No accounts for minors.{"\n\n"}Launch geography. The early release is focused on New York City; features may be geogated during the MVP.{"\n\n"}Account & verification. You agree to provide accurate information. We may require selfie or government‑ID verification to access or retain access to certain features; verification does not guarantee someone’s identity or safety.{"\n\n"}One account per person. You will not share your account or create accounts on behalf of others without permission.</Text>

        <Text style={styles.h2}>4) The Services (what we provide)</Text>
        <Text style={styles.p}>Joyn OS helps you: (a) capture live availability and activity/budget preferences; (b) receive AI‑assisted match cards with a 15‑minute acceptance window; (c) chat in a lobby with ice‑breakers; (d) pick between two AI‑generated plan options; and (e) commit and check‑in when you arrive. We offer an “Explain my match” panel that summarizes high‑level factors (e.g., shared interests, timing overlap, coarse location buckets, and reliability tier badges) without exposing sensitive inputs or exact locations. We also provide optional reservation routing via third‑party directories/APIs (e.g., OpenTable, Resy, SevenRooms, Ticketmaster) and mapping links. Availability is not guaranteed.{"\n\n"}Important: Joyn OS is not a dating service, background‑check service, event organizer, or travel/venue provider. We surface options and help coordinate; you are responsible for your choices and your offline conduct.</Text>

        <Text style={styles.h2}>5) Safety features (and limits)</Text>
        <Text style={styles.p}>We provide block/report, optional verification, a blurred‑radius location mode, check‑in flows (manual plus 150‑meter geofence fallback), and internal reputation signals aimed at discouraging no‑shows and abuse. These features reduce risk but cannot eliminate it. Always exercise caution when meeting new people.</Text>

        <Text style={styles.h2}>6) Reliability score, timers, and feature access</Text>
        <Text style={styles.p}>To support trust, Joyn OS may apply timers and an internal reliability signal (e.g., commitment/cancellation patterns). Examples include: a T‑2h commit decision and reputation impact for late skips/no‑shows; persistent low reliability may throttle feed density or limit features. You may see non‑numeric badges (e.g., “Reliable”); we do not show your numeric score.</Text>

        <Text style={styles.h2}>7) Purchases, subscriptions, and payments</Text>
        <Text style={styles.p}>Commit Boost & other paid features. The app may offer in‑app purchases (e.g., Commit Boost with time‑of‑day tiers). Prices and a clear disclosure are shown before you buy. All charges are handled by our payment processor (currently Stripe); you authorize Joyn OS to charge your chosen payment method for purchases and applicable taxes/fees.{"\n\n"}Tickets, tabs, and venue payments. Some plans may include prepayment, deposits, or ticketing via third parties. Their terms apply. Joyn OS may act as a limited collection agent and/or receive a commission from participating partners; we will show you the total you pay before purchase.{"\n\n"}Refunds. Except where required by law, purchases are non‑refundable once a plan locks or a digital item is delivered. If a venue cancels, we will seek a refund or credit from the partner on your behalf where possible.</Text>

        <Text style={styles.h2}>8) User content and license</Text>
        <Text style={styles.p}>You may create or upload content (e.g., messages, profile photos, lobby names, plan titles). You grant Joyn OS a worldwide, royalty‑free, sublicensable license to host, store, reproduce, modify, publish, and display your content solely to operate and improve the Services. You represent you have the necessary rights to the content you post. We may remove content that violates these Terms or our guidelines.</Text>

        <Text style={styles.h2}>9) Acceptable use</Text>
        <Text style={styles.p}>You agree not to: harass, stalk, dox, or discriminate against others; share others’ personal data without consent; spam, scam, or conduct illegal activity; attempt to reverse engineer or scrape our Services; or circumvent safety features or misrepresent your identity. We may suspend or terminate accounts that breach these rules.</Text>

        <Text style={styles.h2}>10) AI features and accuracy</Text>
        <Text style={styles.p}>We use AI and other automated systems to generate plan options and match suggestions. Outputs may be incomplete or wrong, venue data can be stale, and availability can change. These are recommendations, not professional advice. You are responsible for your decisions.</Text>

        <Text style={styles.h2}>11) Third‑party services</Text>
        <Text style={styles.p}>Our Services link to or rely on third‑party platforms (e.g., maps, reservation and ticketing providers, payments). Their terms and privacy practices govern your use of those features. We are not responsible for their acts or omissions.</Text>

        <Text style={styles.h2}>12) Changes, availability, and beta features</Text>
        <Text style={styles.p}>We may add, change, or remove features and may suspend the Services for maintenance, security, or legal reasons. Early‑access or beta features may be unstable and can be withdrawn at any time.</Text>

        <Text style={styles.h2}>13) Termination</Text>
        <Text style={styles.p}>You may stop using the Services at any time. We may suspend or terminate your account for violations of these Terms, risk to others, non‑payment, or legal/regulatory reasons. On termination, certain sections (e.g., intellectual property, disclaimers, limitations of liability, dispute resolution) survive.</Text>

        <Text style={styles.h2}>14) Disclaimers; limitation of liability</Text>
        <Text style={styles.p}>The Services are provided “as is” and “as available.” To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non‑infringement.{"\n\n"}To the fullest extent permitted by law, Joyn OS will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenues, data, or goodwill. Our aggregate liability for all claims relating to the Services is limited to the greater of (a) $100 or (b) the amounts you paid to Joyn OS in the 12 months before the claim.</Text>

        <Text style={styles.h2}>15) Indemnity</Text>
        <Text style={styles.p}>You agree to indemnify and hold Joyn OS, its officers, employees, and partners harmless from claims, losses, and expenses (including reasonable attorneys’ fees) arising from your misuse of the Services, your content, or your violation of these Terms or applicable law.</Text>

        <Text style={styles.h2}>16) Dispute resolution; governing law</Text>
        <Text style={styles.p}>Governing law & venue. These Terms are governed by the laws of the State of New York (without regard to conflicts of laws), and disputes will be resolved in New York County, New York, unless preempted by arbitration below.{"\n\n"}Arbitration & class‑action waiver (U.S.). Except for small‑claims matters or where prohibited by law, disputes will be resolved by binding individual arbitration under the rules of JAMS. No class actions or class arbitrations. You may opt out within 30 days of accepting these Terms by emailing [insert email] with subject “Arbitration opt‑out.”{"\n\n"}Nothing in this section limits rights that cannot be waived by law.</Text>

        <Text style={styles.h2}>17) Additional notices about safety and regulation</Text>
        <Text style={styles.p}>Joyn OS is designed to reduce endless scrolling and emphasize “moments over feeds,” aligning with evolving expectations around algorithmic transparency and location privacy. Our product includes optional blurred location and an “Explain my match” panel to increase clarity for users.</Text>

        <Text style={styles.h2}>18) Entire agreement; severability; assignment; waiver</Text>
        <Text style={styles.p}>These Terms (plus any feature‑specific terms and our Privacy Policy) are the entire agreement between you and Joyn OS. If any provision is unenforceable, the remainder remains in effect. We may assign these Terms; you may not without our consent. Our failure to enforce a provision is not a waiver.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  updated: {
    color: '#aaa',
    marginBottom: 16,
  },
  h2: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  p: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 20,
  },
});