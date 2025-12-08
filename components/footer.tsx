"use client"

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Footer content grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground uppercase text-sm tracking-wider">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.ourStory")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground uppercase text-sm tracking-wider">{t("footer.explore")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tours" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.tours")}
                </Link>
              </li>
              <li>
                <Link href="/cities" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.cities")}
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.guides")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground uppercase text-sm tracking-wider">{t("footer.resources")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.blog")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground uppercase text-sm tracking-wider">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.termsOfService")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}
