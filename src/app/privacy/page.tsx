import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Last updated: May 12, 2026
          </p>

          <div className="mt-10 space-y-8 text-base leading-8 text-neutral-700">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                1. Overview
              </h2>
              <p className="mt-3">
                Appointly provides online booking tools for independent service
                providers. This Privacy Policy explains what information may be
                collected, how it may be used, and what choices users may have.
                By using Appointly, users agree to this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                2. Information we may collect
              </h2>
              <p className="mt-3">Appointly may collect information such as:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>provider names, emails, phone numbers, profile details;</li>
                <li>service names, prices, durations, categories, policies;</li>
                <li>client names, emails, phone numbers, appointment details;</li>
                <li>messages submitted through contact or booking forms;</li>
                <li>billing and subscription identifiers from payment providers;</li>
                <li>technical information such as IP address, browser data, logs, and security events;</li>
                <li>uploaded images such as provider avatar photos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                3. How information may be used
              </h2>
              <p className="mt-3">Information may be used to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>create and manage booking pages;</li>
                <li>process appointment requests and confirmations;</li>
                <li>send confirmation, cancellation, reminder, login, and account emails;</li>
                <li>show appointment details to the relevant provider;</li>
                <li>provide support and respond to contact requests;</li>
                <li>process subscriptions and billing through payment providers;</li>
                <li>protect the platform from spam, abuse, fraud, and unauthorized access;</li>
                <li>improve, maintain, and debug the service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                4. Information shared with providers
              </h2>
              <p className="mt-3">
                When a client requests or confirms an appointment, the relevant
                provider may receive the client’s name, email, phone number,
                service, date, time, and cancellation status. Providers are
                responsible for how they use information they receive through
                Appointly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                5. Third-party service providers
              </h2>
              <p className="mt-3">
                Appointly may use third-party providers for hosting, database,
                storage, email delivery, payment processing, security checks,
                analytics, and infrastructure. These providers may process data
                as necessary to provide their services.
              </p>
              <p className="mt-3">
                Appointly is not responsible for the independent practices,
                policies, outages, or security incidents of third-party
                providers, except where applicable law provides otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                6. Public provider pages
              </h2>
              <p className="mt-3">
                Provider profile information, services, prices, photos, social
                links, availability-related information, city, country, and
                neighborhood may be displayed publicly on provider booking
                pages. Providers should not publish information they do not want
                to be public.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                7. Security
              </h2>
              <p className="mt-3">
                Appointly uses technical and organizational measures intended to
                reduce unauthorized access, abuse, and data loss. However, no
                website, hosting provider, database, storage system, email
                system, payment provider, or internet transmission can be
                guaranteed to be completely secure.
              </p>
              <p className="mt-3">
                Users submit information through Appointly at their own risk and
                should avoid submitting unnecessary sensitive information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                8. Sensitive information
              </h2>
              <p className="mt-3">
                Appointly is not designed to store medical records, diagnoses,
                legal documents, financial records, government identification
                numbers, passwords, payment card numbers, or other highly
                sensitive information. Users and providers should not submit
                such information through booking forms, service descriptions,
                messages, or profile fields.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                9. Data retention
              </h2>
              <p className="mt-3">
                Appointly may retain information for as long as needed to
                provide the service, maintain business records, prevent fraud,
                resolve disputes, comply with legal obligations, enforce terms,
                and operate backups and logs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                10. User choices
              </h2>
              <p className="mt-3">
                Providers may update certain account and public profile
                information through their dashboard. Users may use cancellation
                links provided by email where available. Requests regarding
                personal information may be submitted through the contact page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                11. Children
              </h2>
              <p className="mt-3">
                Appointly is not intended for children under 13. Users should
                not submit information about children unless they have the legal
                authority to do so and the information is necessary for the
                appointment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                12. International users
              </h2>
              <p className="mt-3">
                Appointly may be accessed from different countries. By using the
                service, users understand that information may be processed in
                the United States or other locations where Appointly or its
                service providers operate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                13. Changes to this Privacy Policy
              </h2>
              <p className="mt-3">
                Appointly may update this Privacy Policy from time to time.
                Continued use of the service after changes are posted means the
                user accepts the updated policy, to the extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900">
                14. Contact
              </h2>
              <p className="mt-3">
                Questions about this Privacy Policy may be submitted through the
                contact page linked in the footer.
              </p>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}