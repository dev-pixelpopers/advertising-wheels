/* ------------------------------------------------------------------------
 * ⚠️  DRAFT — NOT LEGAL ADVICE. MUST BE REVIEWED BY COUNSEL BEFORE LAUNCH.
 *
 * This is a standard privacy policy for a US business-to-business lead
 * generation site, written to match what this site actually does today. It is
 * a starting point for a lawyer, not a substitute for one.
 *
 * Before publishing, someone with the facts must resolve every `[bracketed]`
 * placeholder below and confirm:
 *   • the registered legal entity name and mailing address;
 *   • which analytics/advertising tools are actually deployed (the cookie
 *     section currently describes analytics generically — if there is no
 *     analytics on the site, cut it; if there is retargeting, it must be named);
 *   • whether the geofenced retargeting product described on the marketing
 *     pages processes personal data in a way that needs disclosing here;
 *   • the retention period, which is asserted below as a round number;
 *   • that Tennessee is the intended governing jurisdiction.
 * ---------------------------------------------------------------------- */

import type { Metadata } from 'next';
import LegalPage, { LegalList, LegalSection } from '@/components/site/LegalPage';

export const metadata: Metadata = {
    title: 'Privacy Policy — Advertising Wheels',
    description:
        'How Advertising Wheels collects, uses and protects personal information submitted through this website, and the rights you have over that information.',
};

const CONTACT_EMAIL = 'BrandGrowth@advertisingwheels.com';
const CONTACT_PHONE = '1-877-4-ADWHEELS (1-877-423-9433)';

export default function PrivacyPolicyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            lastUpdated="5 August 2026"
            intro={
                <p>
                    This policy explains what personal information Advertising Wheels collects through
                    this website, why we collect it, who we share it with, and the choices you have.
                    It applies to this website only — not to campaign data we process for advertisers
                    under a separate services agreement.
                </p>
            }
        >
            <LegalSection heading="Who we are">
                <p>
                    Advertising Wheels ([Legal entity name]) is a mobile truckside advertising company
                    headquartered in Nashville, Tennessee. For the purposes of this policy we are the
                    controller of the personal information described below.
                </p>
                <p>
                    You can reach us at{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1A1917] underline underline-offset-2 dark:text-white">
                        {CONTACT_EMAIL}
                    </a>{' '}
                    or {CONTACT_PHONE}. Our mailing address is [Street address, Nashville, TN, ZIP].
                </p>
            </LegalSection>

            <LegalSection heading="Information we collect">
                <p>
                    <strong className="font-tommy-medium text-[#1A1917] dark:text-white">
                        Information you give us.
                    </strong>{' '}
                    When you submit our contact form, apply as a fleet partner, or subscribe to our
                    newsletter, we collect what you enter — typically your name, company, email
                    address, telephone number, the nature of your enquiry and anything else you choose
                    to include in your message.
                </p>
                <p>
                    <strong className="font-tommy-medium text-[#1A1917] dark:text-white">
                        Information collected automatically.
                    </strong>{' '}
                    Like most websites, ours may record technical information when you visit: IP
                    address, browser and device type, referring page, the pages you view and the time
                    of your visit. This is used to keep the site working and to understand which pages
                    are useful.
                </p>
                <p>
                    We do not ask for, and you should not send us, sensitive categories of personal
                    information — government identifiers, financial account numbers, health
                    information or precise geolocation.
                </p>
            </LegalSection>

            <LegalSection heading="How we use your information">
                <LegalList
                    items={[
                        'To respond to your enquiry and to contact you about a potential campaign or partnership.',
                        'To send our newsletter, where you have asked to receive it.',
                        'To evaluate fleet partner applications.',
                        'To operate, secure, troubleshoot and improve this website.',
                        'To comply with legal obligations and to establish or defend legal claims.',
                    ]}
                />
                <p>
                    We do not use the information you submit to make automated decisions that produce
                    legal or similarly significant effects about you.
                </p>
            </LegalSection>

            <LegalSection heading="Our legal bases (UK and EEA visitors)">
                <p>
                    Where UK or EU data protection law applies, we rely on: your <em>consent</em> for
                    marketing emails, which you may withdraw at any time; our <em>legitimate interests</em>{' '}
                    in responding to business enquiries, assessing partner applications and securing
                    our site; and <em>compliance with a legal obligation</em> where we are required to
                    retain or disclose information.
                </p>
            </LegalSection>

            <LegalSection heading="Cookies and analytics">
                <p>
                    We use cookies and similar technologies that are strictly necessary for the site to
                    function, and we may use analytics cookies to measure how the site is used. You can
                    block or delete cookies through your browser settings; blocking strictly necessary
                    cookies may stop parts of the site from working.
                </p>
                <p>
                    We honour the Global Privacy Control (GPC) signal where your browser sends one, and
                    treat it as a request to opt out of any sharing of personal information for
                    cross-context behavioural advertising.
                </p>
            </LegalSection>

            <LegalSection heading="Who we share it with">
                <p>
                    We do <strong className="font-tommy-medium text-[#1A1917] dark:text-white">not</strong>{' '}
                    sell your personal information, and we do not share it for cross-context
                    behavioural advertising.
                </p>
                <p>We do disclose information to:</p>
                <LegalList
                    items={[
                        'Service providers who work on our behalf — website hosting, email delivery and analytics — under contracts limiting them to that purpose.',
                        'Professional advisers, where reasonably necessary.',
                        'A buyer or successor, if the business is sold or reorganised.',
                        'Law enforcement or regulators, where we are legally required to do so.',
                    ]}
                />
            </LegalSection>

            <LegalSection heading="How long we keep it">
                <p>
                    We keep enquiry and application records for as long as needed to deal with your
                    request and for a reasonable period afterwards — normally no more than [24] months
                    — unless a longer period is required by law or to resolve a dispute. Newsletter
                    subscriptions are kept until you unsubscribe.
                </p>
            </LegalSection>

            <LegalSection heading="Security">
                <p>
                    We use reasonable administrative, technical and physical safeguards appropriate to
                    the sensitivity of the information we hold. No method of transmission or storage is
                    completely secure, so we cannot guarantee absolute security.
                </p>
            </LegalSection>

            <LegalSection heading="Your rights">
                <p>
                    <strong className="font-tommy-medium text-[#1A1917] dark:text-white">
                        California residents (CCPA/CPRA).
                    </strong>{' '}
                    You have the right to know what personal information we have collected and how we
                    use it; to request deletion; to request correction; to opt out of any sale or
                    sharing of personal information (we do neither); and not to be discriminated
                    against for exercising these rights.
                </p>
                <p>
                    <strong className="font-tommy-medium text-[#1A1917] dark:text-white">
                        UK and EEA residents (GDPR).
                    </strong>{' '}
                    You have the right to access, correct, erase, restrict or object to our processing
                    of your personal information, and to receive it in a portable format. You may also
                    lodge a complaint with your local supervisory authority.
                </p>
                <p>
                    To exercise any of these rights, email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1A1917] underline underline-offset-2 dark:text-white">
                        {CONTACT_EMAIL}
                    </a>
                    . We will verify your request before acting on it and will respond within the time
                    required by applicable law. You may use an authorised agent.
                </p>
            </LegalSection>

            <LegalSection heading="International transfers">
                <p>
                    We are based in the United States and process information there. If you contact us
                    from outside the US, your information will be transferred to and stored in the US,
                    which may not offer the same level of protection as your home country. Where
                    required, we put appropriate safeguards in place for those transfers.
                </p>
            </LegalSection>

            <LegalSection heading="Children">
                <p>
                    This site is aimed at businesses and is not directed to children. We do not
                    knowingly collect personal information from anyone under 16. If you believe a child
                    has given us information, contact us and we will delete it.
                </p>
            </LegalSection>

            <LegalSection heading="Changes to this policy">
                <p>
                    We may update this policy from time to time. The date at the top of this page shows
                    when it was last revised, and any material change will be reflected there. Your
                    continued use of the site after an update means you accept the revised policy.
                </p>
            </LegalSection>

            <LegalSection heading="Contact us">
                <p>
                    Questions about this policy or about how we handle your information? Email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1A1917] underline underline-offset-2 dark:text-white">
                        {CONTACT_EMAIL}
                    </a>
                    , call {CONTACT_PHONE}, or write to us at [Street address, Nashville, TN, ZIP].
                </p>
            </LegalSection>
        </LegalPage>
    );
}
