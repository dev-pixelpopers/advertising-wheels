/* ------------------------------------------------------------------------
 * ⚠️  DRAFT — NOT LEGAL ADVICE. MUST BE REVIEWED BY COUNSEL BEFORE LAUNCH.
 *
 * Standard website terms for a US B2B marketing site. A starting point for a
 * lawyer, not a substitute for one.
 *
 * Before publishing, resolve every `[bracketed]` placeholder and confirm:
 *   • the registered legal entity name and mailing address;
 *   • that Tennessee law and Davidson County venue are intended;
 *   • whether an arbitration clause and class-action waiver are wanted — there
 *     is deliberately none here, because that is a decision for counsel;
 *   • that the performance-claims disclaimer below matches what the marketing
 *     pages actually assert once the credential audit is finished.
 * ---------------------------------------------------------------------- */

import type { Metadata } from 'next';
import LegalPage, { LegalList, LegalSection } from '@/components/site/LegalPage';

export const metadata: Metadata = {
    title: 'Terms & Conditions — Advertising Wheels',
    description:
        'The terms governing your use of the Advertising Wheels website, including acceptable use, intellectual property, disclaimers and limitation of liability.',
};

const CONTACT_EMAIL = 'BrandGrowth@advertisingwheels.com';

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms & Conditions"
            lastUpdated="5 August 2026"
            intro={
                <p>
                    These terms govern your use of the Advertising Wheels website. They are not the
                    terms of any advertising campaign or fleet partnership — those are set out in a
                    separate signed agreement, which takes precedence over anything on this page.
                </p>
            }
        >
            <LegalSection heading="Accepting these terms">
                <p>
                    By accessing or using this site you agree to these terms. If you do not agree,
                    please do not use the site. If you are using it on behalf of a company, you confirm
                    you have authority to bind that company.
                </p>
            </LegalSection>

            <LegalSection heading="This site is informational">
                <p>
                    Everything on this site — service descriptions, market coverage, case studies,
                    pricing indications — is provided for general information. Nothing here is an offer
                    capable of acceptance, a quote, or a commitment to provide services. A campaign
                    exists only once we have both signed a written agreement.
                </p>
            </LegalSection>

            <LegalSection heading="Performance figures and case studies">
                <p>
                    Impression estimates, coverage figures, market data and campaign results shown on
                    this site are historical or modeled, describe specific past campaigns under
                    specific conditions, and are not a prediction, guarantee or warranty of the results
                    any other advertiser will achieve. Third-party measurement is subject to the
                    methodology of the measuring firm.
                </p>
            </LegalSection>

            <LegalSection heading="Intellectual property">
                <p>
                    The site and its contents — text, graphics, photography, video, layout, code and
                    the Advertising Wheels name and logo — are owned by us or our licensors and are
                    protected by intellectual property laws. You may view and print pages for your own
                    internal business use. You may not copy, republish, sell, scrape, frame or create
                    derivative works from the site without our written permission.
                </p>
                <p>
                    Third-party names, logos and trade marks shown on this site remain the property of
                    their respective owners and are used to identify those parties only.
                </p>
            </LegalSection>

            <LegalSection heading="Acceptable use">
                <p>You agree not to:</p>
                <LegalList
                    items={[
                        'Use the site for any unlawful purpose or in breach of these terms.',
                        'Attempt to gain unauthorised access to the site, its servers or any connected system.',
                        'Introduce malware, or interfere with the site’s operation or availability.',
                        'Scrape, harvest or systematically extract content or data from the site.',
                        'Submit false, misleading or third-party information through our forms.',
                    ]}
                />
            </LegalSection>

            <LegalSection heading="What you submit to us">
                <p>
                    Information you send through our contact form, partner application or newsletter
                    signup is handled as described in our{' '}
                    <a href="/privacy" className="text-[#1A1917] underline underline-offset-2 dark:text-white">
                        Privacy Policy
                    </a>
                    . Please do not send us confidential or proprietary material through this site — we
                    cannot treat unsolicited submissions as confidential. If you send us ideas,
                    feedback or suggestions, you grant us a non-exclusive, royalty-free licence to use
                    them without obligation to you.
                </p>
                <p>
                    You are responsible for the accuracy of what you submit, and for having the right
                    to share any third-party information you include.
                </p>
            </LegalSection>

            <LegalSection heading="Third-party links">
                <p>
                    This site may link to sites we do not control. We provide those links for
                    convenience, do not endorse the linked sites, and are not responsible for their
                    content, products or privacy practices.
                </p>
            </LegalSection>

            <LegalSection heading="Disclaimer">
                <p>
                    The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the
                    fullest extent permitted by law we disclaim all warranties, express or implied,
                    including merchantability, fitness for a particular purpose and non-infringement.
                    We do not warrant that the site will be uninterrupted, error-free or free of
                    harmful components, or that the information on it is complete or current.
                </p>
            </LegalSection>

            <LegalSection heading="Limitation of liability">
                <p>
                    To the fullest extent permitted by law, Advertising Wheels and its officers,
                    employees and agents will not be liable for any indirect, incidental, special,
                    consequential or punitive damages, or for lost profits, revenue, data or business
                    opportunity, arising out of your use of this site — even if we have been advised
                    such damages are possible. Our total aggregate liability arising from your use of
                    the site will not exceed [US $100].
                </p>
                <p>
                    Nothing in these terms excludes liability that cannot lawfully be excluded. Some
                    jurisdictions do not allow certain limitations, so parts of this section may not
                    apply to you.
                </p>
            </LegalSection>

            <LegalSection heading="Indemnity">
                <p>
                    You agree to indemnify and hold harmless Advertising Wheels against claims, losses
                    and reasonable legal costs arising from your misuse of the site, your breach of
                    these terms, or your violation of any law or third-party right.
                </p>
            </LegalSection>

            <LegalSection heading="Governing law">
                <p>
                    These terms are governed by the laws of the State of Tennessee, without regard to
                    its conflict-of-laws rules. You and we agree that the state and federal courts
                    located in [Davidson County, Tennessee] have exclusive jurisdiction over any
                    dispute arising from these terms or your use of the site.
                </p>
            </LegalSection>

            <LegalSection heading="Changes and severability">
                <p>
                    We may revise these terms at any time; the date at the top of this page shows when
                    they were last changed, and continued use of the site means you accept the revised
                    terms. If any provision is found unenforceable, the rest remains in force. Our
                    failure to enforce a provision is not a waiver of it.
                </p>
            </LegalSection>

            <LegalSection heading="Contact">
                <p>
                    Questions about these terms? Email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1A1917] underline underline-offset-2 dark:text-white">
                        {CONTACT_EMAIL}
                    </a>{' '}
                    or write to [Legal entity name], [Street address, Nashville, TN, ZIP].
                </p>
            </LegalSection>
        </LegalPage>
    );
}
