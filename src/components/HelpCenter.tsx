"use client";

import { CircleHelp, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { Tr } from "./Tr";
import { getHelpInfo, hasContact, telHref, whatsappHref, type HelpInfo } from "@/lib/help";

/**
 * Public help centre: answers to the usual questions, with the figures that
 * must stay true (return window, response time) and the contact channels read
 * from the server. No account needed.
 */
export function HelpCenter() {
  const { user } = useAuth();
  const [info, setInfo] = useState<HelpInfo | null>(null);

  useEffect(() => {
    getHelpInfo().then(setInfo);
  }, []);

  const days = info?.return_window_days;
  const hours = info?.first_response_hours;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-2 rounded-sm bg-surface p-5 shadow-card border-b-4 border-b-gold sm:p-8">
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
          <CircleHelp className="h-6 w-6 text-gold" aria-hidden /> <Tr>Centre d&apos;aide</Tr>
        </h1>
        <p className="text-sm text-ink-soft">
          <Tr>Les réponses aux questions les plus fréquentes. Aucun compte n&apos;est nécessaire pour les lire.</Tr>
        </p>
      </section>

      <section className="flex flex-col divide-y divide-line rounded-sm bg-surface shadow-card border-b-4 border-b-gold">
        <Question id="commander" title={<Tr>Faut-il un compte pour commander ?</Tr>}>
          <Tr>Non. Pour commander, indiquez seulement votre nom complet, votre numéro de téléphone et le lieu de livraison. Un compte sert à retrouver vos commandes, vos factures et à demander un retour.</Tr>
        </Question>

        <Question id="paiement" title={<Tr>Comment payer ma commande ?</Tr>}>
          <Tr>Le paiement se fait à la livraison, au livreur, à la remise du colis. Aucun paiement n&apos;est demandé en ligne.</Tr>
        </Question>

        <Question id="suivi" title={<Tr>Comment suivre ma commande ?</Tr>}>
          <Tr>Sans compte, ouvrez la page de suivi, saisissez le numéro de commande reçu à la validation puis le téléphone utilisé.</Tr>{" "}
          <Link href="/suivi" className="font-medium text-gold-bright underline underline-offset-4">
            <Tr>Suivre ma commande</Tr>
          </Link>
          . <Tr>Avec un compte, toutes vos commandes sont dans « Mes commandes ».</Tr>
        </Question>

        <Question id="code" title={<Tr>À quoi sert le code de livraison ?</Tr>}>
          <Tr>C&apos;est un code à six chiffres affiché avec votre commande. Ne le donnez au livreur qu&apos;au moment où vous recevez votre colis : c&apos;est votre preuve de remise.</Tr>
        </Question>

        <Question id="colis" title={<Tr>Pourquoi ma commande arrive-t-elle en plusieurs colis ?</Tr>}>
          <Tr>Quand votre commande contient des articles de vendeurs différents, chaque vendeur expédie sa part : vous suivez chaque colis séparément, avec sa propre progression.</Tr>
        </Question>

        <Question id="retours" title={<Tr>Comment retourner un article ?</Tr>}>
          {days ? (
            <>
              <Tr>Vous pouvez demander un retour jusqu&apos;à</Tr> {days} <Tr>jours après la livraison.</Tr>{" "}
            </>
          ) : (
            <>
              <Tr>Un retour se demande dans un délai limité après la livraison.</Tr>{" "}
            </>
          )}
          <Tr>Connectez-vous, ouvrez la commande livrée puis « Retour d&apos;articles » : choisissez les articles et expliquez pourquoi. Le support vous répond et le remboursement se fait selon l&apos;état du colis reçu.</Tr>
        </Question>

        <Question id="factures" title={<Tr>Où trouver ma facture ?</Tr>}>
          <Tr>Votre facture est émise quand la commande est confirmée. Elle est disponible en PDF dans votre compte, rubrique « Mes factures », et vous est envoyée par e-mail si vous avez donné une adresse.</Tr>
        </Question>

        <Question id="messages" title={<Tr>Je ne reçois pas de message sur ma commande</Tr>}>
          <Tr>Les messages de suivi sont envoyés par SMS au numéro donné à la commande, et par e-mail si vous avez indiqué une adresse. Vérifiez le numéro, ou suivez directement votre commande depuis la page de suivi.</Tr>
        </Question>
      </section>

      <section id="contact" className="flex flex-col gap-3 rounded-sm bg-surface p-5 shadow-card border-b-4 border-b-gold sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">
          <Tr>Besoin d&apos;aide supplémentaire ?</Tr>
        </h2>

        {user ? (
          <p className="text-sm text-ink-soft">
            <Tr>Ouvrez une demande : le support vous répond ici.</Tr>{" "}
            <Link href="/support" className="font-medium text-gold-bright underline underline-offset-4">
              <Tr>Contacter le support</Tr>
            </Link>
          </p>
        ) : (
          <p className="text-sm text-ink-soft">
            <Tr>Connectez-vous pour ouvrir une demande auprès du support.</Tr>{" "}
            <Link href="/connexion" className="font-medium text-gold-bright underline underline-offset-4">
              <Tr>Se connecter</Tr>
            </Link>
          </p>
        )}

        {hours ? (
          <p className="text-sm text-ink-soft">
            <Tr>Objectif de première réponse :</Tr> {hours} <Tr>heures.</Tr>
          </p>
        ) : null}

        {info && hasContact(info.contact) ? (
          <ul className="flex flex-col gap-2 text-sm text-ink">
            {info.contact.phone ? (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" aria-hidden />
                <a href={telHref(info.contact.phone)} className="underline-offset-4 hover:underline">
                  {info.contact.phone}
                </a>
              </li>
            ) : null}
            {info.contact.whatsapp ? (
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gold" aria-hidden />
                <a href={whatsappHref(info.contact.whatsapp)} rel="noopener noreferrer" target="_blank" className="underline-offset-4 hover:underline">
                  WhatsApp {info.contact.whatsapp}
                </a>
              </li>
            ) : null}
            {info.contact.email ? (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" aria-hidden />
                <a href={`mailto:${info.contact.email}`} className="underline-offset-4 hover:underline">
                  {info.contact.email}
                </a>
              </li>
            ) : null}
            {info.contact.hours ? <li className="text-ink-soft">{info.contact.hours}</li> : null}
          </ul>
        ) : null}
      </section>
    </main>
  );
}

function Question({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) {
  return (
    <details id={id} className="group px-5 py-4 open:bg-bg/40">
      <summary className="cursor-pointer list-none font-medium text-ink marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          {title}
          <span className="text-gold transition-transform group-open:rotate-45" aria-hidden>
            +
          </span>
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{children}</p>
    </details>
  );
}
