import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Terms of Service
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Last updated: May 12, 2026
          </p>

          <div className="mt-10 space-y-8 text-base leading-8 text-neutral-700">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                1. Acceptance of these Terms
              </h2>
              <p className="mt-3">
                By accessing, browsing, registering for, booking through, or
                otherwise using Appointly, you agree to these Terms of Service.
                If you do not agree, do not use the website or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                2. Appointly is a technology platform
              </h2>
              <p className="mt-3">
                Appointly provides online booking tools for independent service
                providers. Appointly is not a salon, clinic, medical provider,
                repair shop, therapist, consultant, employer, agent, partner, or
                representative of any service provider listed on the platform.
              </p>
              <p className="mt-3">
                Service providers are solely responsible for their own services,
                prices, descriptions, availability, communications, licenses,
                qualifications, legal compliance, cancellations, refunds, and
                customer relationships.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                3. No professional advice
              </h2>
              <p className="mt-3">
                Appointly does not provide medical, legal, financial,
                therapeutic, technical, repair, beauty, or other professional
                advice. Any information, service description, price, policy, or
                communication shown on a provider page is supplied by the
                provider or entered through the platform.
              </p>
              <p className="mt-3">
                Users are responsible for evaluating whether a provider,
                service, appointment, or communication is suitable for them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                4. User and provider responsibility
              </h2>
              <p className="mt-3">
                Users and providers agree not to submit false, misleading,
                illegal, harmful, abusive, infringing, spam, or fraudulent
                content or requests. Users are responsible for the accuracy of
                the information they submit, including names, phone numbers,
                email addresses, appointment details, and messages.
              </p>
              <p className="mt-3">
                Providers are responsible for keeping their booking page,
                services, availability, contact information, cancellation
                policies, and appointment details accurate and up to date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                5. Appointments, confirmations, and cancellations
              </h2>
              <p className="mt-3">
                Appointment requests may require email confirmation. An
                appointment may not be treated as confirmed until the user
                follows the confirmation link sent by email.
              </p>
              <p className="mt-3">
                Appointly may send appointment confirmations, reminders, and
                cancellation links by email. Delivery of email is not
                guaranteed. Users should check their inbox, spam, promotions,
                and other email folders.
              </p>
              <p className="mt-3">
                Appointly is not responsible for missed appointments, incorrect
                contact information, email delivery failures, provider schedule
                changes, user cancellations, provider cancellations, or disputes
                between users and providers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                6. Payments and subscriptions
              </h2>
              <p className="mt-3">
                Providers may purchase paid subscriptions. Subscription
                payments, trials, renewals, upgrades, downgrades, and billing
                portal access may be processed by third-party payment providers
                such as Stripe.
              </p>
              <p className="mt-3">
                Appointly may change pricing, features, trial availability, or
                subscription terms at any time, subject to applicable law and
                payment processor rules.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                7. User content
              </h2>
              <p className="mt-3">
                Providers may submit names, descriptions, photos, service
                details, prices, policies, social links, and other content.
                Providers represent that they have the right to submit and
                display such content.
              </p>
              <p className="mt-3">
                Appointly may remove, hide, restrict, or refuse content or
                accounts that appear to violate these Terms, applicable law, or
                platform safety requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                8. Availability and security
              </h2>
              <p className="mt-3">
                Appointly is provided on an “as is” and “as available” basis.
                Appointly does not guarantee that the website, booking pages,
                emails, reminders, confirmations, storage, integrations, or
                third-party services will be uninterrupted, error-free, secure,
                or available at all times.
              </p>
              <p className="mt-3">
                Users understand that no website, database, email system,
                hosting provider, storage service, or internet transmission can
                be guaranteed to be completely secure. Users submit information
                through Appointly at their own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                9. Third-party services
              </h2>
              <p className="mt-3">
                Appointly may rely on third-party services, including hosting,
                database, email, storage, payment, security, analytics, and
                communication providers. Appointly is not responsible for the
                acts, omissions, downtime, pricing, policy changes, data
                handling, or failures of third-party providers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                10. Disclaimer of warranties
              </h2>
              <p className="mt-3">
                To the maximum extent permitted by law, Appointly disclaims all
                warranties, express or implied, including warranties of
                merchantability, fitness for a particular purpose,
                non-infringement, accuracy, availability, reliability,
                uninterrupted operation, and security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                11. Limitation of liability
              </h2>
              <p className="mt-3">
                To the maximum extent permitted by law, Appointly, its owner,
                operators, affiliates, contractors, and service providers will
                not be liable for indirect, incidental, special, consequential,
                exemplary, punitive, or lost-profit damages, or for loss of
                data, business interruption, missed appointments, provider
                disputes, customer disputes, security incidents, unauthorized
                access, third-party failures, or service interruptions.
              </p>
              <p className="mt-3">
                To the maximum extent permitted by law, Appointly’s total
                liability for any claim will not exceed the greater of: (a) the
                amount paid by the user to Appointly during the three months
                before the claim, or (b) 100 US dollars.
              </p>
              <p className="mt-3">
                Some jurisdictions do not allow certain limitations of
                liability. In those jurisdictions, liability is limited to the
                maximum extent permitted by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                12. Indemnification
              </h2>
              <p className="mt-3">
                Users and providers agree to defend, indemnify, and hold
                Appointly and its owner harmless from claims, losses, damages,
                liabilities, costs, and expenses arising from their use of the
                platform, submitted content, services offered, appointments,
                disputes, violation of these Terms, or violation of applicable
                law or third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                13. Termination
              </h2>
              <p className="mt-3">
                Appointly may suspend, restrict, or terminate access to the
                platform at any time if it believes a user or provider violates
                these Terms, creates risk, abuses the service, submits harmful
                content, or causes technical, legal, payment, security, or
                reputational concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                14. Governing law
              </h2>
              <p className="mt-3">
                These Terms are governed by the laws of the State of New Jersey,
                United States, unless applicable law requires otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                15. Contact
              </h2>
              <p className="mt-3">
                Questions about these Terms may be submitted through the contact
                page linked in the footer.
              </p>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}