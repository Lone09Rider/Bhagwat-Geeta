export default function PrivacyPage() {
  return (
    <div className="page" style={{ maxWidth: 800, lineHeight: 1.85, color: "rgba(212,245,238,0.8)", fontSize: "0.95rem" }}>
      <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "2rem", color: "#D4AF37", marginBottom: "0.25rem" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "rgba(212,245,238,0.4)", fontSize: "0.8rem", marginBottom: "2rem" }}>
        Last updated: June 21, 2026
      </p>

      <Section title="1. Introduction">
        Welcome to <strong style={{ color: "#3DD6C8" }}>Madhav Geeta Saar</strong> ("we", "our", or "us"),
        accessible at <strong>madhavgeetasaar.netlify.app</strong>. We are committed to protecting your
        personal information and your right to privacy. This Privacy Policy explains how we collect, use,
        and safeguard your information when you visit our website.
      </Section>

      <Section title="2. Information We Collect">
        We do not require registration or collect personal data directly. However, the following may be
        collected automatically:
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
          <li>IP address and browser type (via server logs)</li>
          <li>Pages visited and time spent (via analytics)</li>
          <li>Device type and operating system</li>
          <li>Cookies placed by Google AdSense and analytics services</li>
        </ul>
      </Section>

      <Section title="3. Cookies">
        We use cookies to improve your experience. Cookies are small files stored on your device.
        Third-party vendors including <strong>Google</strong> use cookies to serve ads based on your
        prior visits to this or other websites. You can opt out of personalised advertising by visiting
        <a href="https://www.google.com/settings/ads" style={{ color: "#3DD6C8", marginLeft: "0.3rem" }}>
          Google Ad Settings
        </a>.
      </Section>

      <Section title="4. Google AdSense">
        We use Google AdSense to display advertisements. Google, as a third-party vendor, uses cookies
        (including the DoubleClick cookie) to serve ads based on your visits to this site and other sites
        on the Internet. You may opt out of the use of the DoubleClick cookie by visiting the{" "}
        <a href="https://optout.aboutads.info/" style={{ color: "#3DD6C8" }}>
          Digital Advertising Alliance opt-out page
        </a>.
      </Section>

      <Section title="5. AI Chat Feature">
        Our site includes a Krishna AI chat powered by Groq API. Messages you type in the chat are sent
        to Groq's servers to generate responses. We do not store your chat messages. Please do not share
        sensitive personal information in the chat.
      </Section>

      <Section title="6. Local Storage">
        We store your name, gender preference, and reading position in your browser's local storage to
        personalise your experience. This data stays on your device and is never sent to our servers.
      </Section>

      <Section title="7. Third-Party Links">
        Our website may contain links to third-party websites. We have no control over and assume no
        responsibility for the content or privacy practices of any third-party sites.
      </Section>

      <Section title="8. Children's Privacy">
        Our service is not directed to children under 13. We do not knowingly collect personal
        information from children. If you are a parent and believe your child has provided us information,
        please contact us.
      </Section>

      <Section title="9. Your Rights">
        You have the right to:
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
          <li>Opt out of personalised ads via Google Ad Settings</li>
          <li>Clear local storage data via your browser settings</li>
          <li>Contact us regarding any privacy concerns</li>
        </ul>
      </Section>

      <Section title="10. Changes to This Policy">
        We may update this Privacy Policy from time to time. Changes will be posted on this page with
        an updated date. Continued use of the site after changes constitutes acceptance.
      </Section>

      <Section title="11. Contact Us">
        If you have any questions about this Privacy Policy, please contact us at:
        <br />
        <a href="mailto:sr009j@gmail.com" style={{ color: "#D4AF37" }}>sr009j@gmail.com</a>
      </Section>

      <div style={{
        marginTop: "2.5rem",
        padding: "1rem",
        background: "rgba(212,175,55,0.06)",
        border: "1px solid rgba(212,175,55,0.15)",
        borderRadius: "10px",
        fontSize: "0.82rem",
        color: "rgba(212,245,238,0.4)",
        textAlign: "center"
      }}>
        🕉 Madhav Geeta Saar · madhavgeetasaar.netlify.app · sr009j@gmail.com
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 style={{
        fontFamily: "'Rajdhani',sans-serif",
        fontSize: "1.1rem",
        color: "#3DD6C8",
        fontWeight: 700,
        letterSpacing: "0.05em",
        marginBottom: "0.4rem",
        borderBottom: "1px solid rgba(61,214,200,0.15)",
        paddingBottom: "0.3rem"
      }}>{title}</h2>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
