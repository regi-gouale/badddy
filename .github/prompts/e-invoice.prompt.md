---
mode: agent
description: "GitHub Copilot prompt for implementing e-invoicing (Factur-X / UBL) in France"
---

### 4. 🧾 Génération du PDF + insertion du XML (Factur-X hybride)

- Créer `lib/facture/generatePdf.tsx` (avec extension `.tsx` pour JSX)
- Générer le PDF avec `@react-pdf/renderer` (composants React déclaratifs).
- Utiliser `pdf-lib` pour insérer le fichier XML comme pièce jointe (pour respecter le format "Factur-X" complet).
- Ajouter un QR code ou mention "Facture électronique conforme Factur-X".

**Exemple d'architecture** :

````tsx
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";

const InvoicePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Facture {data.number}</Text>
      {/* ... autres composants */}
    </Page>
  </Document>
);

// Génération
const pdfBlob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

// Ajout de la pièce jointe XML avec pdf-lib
const pdfDoc = await PDFDocument.load(pdfBuffer);
await pdfDoc.attach(xmlBuffer, "factur-x.xml", {
  mimeType: "application/xml",
  description: "Fichier XML structuré Factur-X",
});
const finalPdfBytes = await pdfDoc.save();
```e

Vous êtes un ingénieur logiciel senior spécialisé dans le développement d'applications web avec une expertise en facturation électronique conforme aux normes européennes (Factur-X, UBL, CII). Vous avez une solide expérience avec Next.js, TypeScript, Prisma et PostgreSQL.

## Contexte

Implémenter dans l’application la génération, la gestion et l’export de **factures électroniques conformes à la réglementation française (Factur-X / UBL / CII)**.
Les factures doivent être valides juridiquement, contenir toutes les mentions légales, et être exportables au format structuré (XML + PDF).

## 🧱 Stack technique

- Frontend : Next.js (app router)
- Backend : Next.js API routes (TypeScript)
- ORM : Prisma
- Base de données : PostgreSQL
- Auth : Better Auth
- Librairie PDF : `@react-pdf/renderer` + `pdf-lib` (pour les pièces jointes XML)
- Génération XML : `xmlbuilder2` ou `fast-xml-parser`

---

## Task

### 1. ✅ Création de factures électroniques conformes

- Étendre le modèle `Invoice` Prisma pour inclure :

  ```ts
  model Invoice {
    id              String   @id @default(cuid())
    userId          String   @map("user_id")
    clientId        String   @map("client_id")
    number          String   @unique
    issueDate       DateTime @default(now())
    dueDate         DateTime
    totalHt         Float
    totalTtc        Float
    vatRate         Float
    status          InvoiceStatus
    structuredData  Json?    // données XML structurées (UBL / Factur-X)
    pdfUrl          String?
    xmlUrl          String?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
  }
````

- Lorsqu’une facture est générée :
  1. Créer le **PDF** avec les mentions légales requises.
  2. Générer un **fichier XML structuré** (format Factur-X minimal ou UBL).
  3. Stocker les deux versions (PDF + XML) sur le serveur ou S3.
  4. Associer les liens `pdfUrl` et `xmlUrl` dans la DB.

### 2. 📜 Mentions légales obligatoires à inclure dans le XML et le PDF

- Numéro de facture
- Date d’émission
- Date d’échéance
- Nom / adresse / SIRET / TVA intracom de l’émetteur
- Nom / adresse / SIRET du client
- Montants HT, TVA, TTC
- Détails des lignes (désignation, quantité, prix unitaire HT, taux TVA)
- Mode de règlement
- IBAN / BIC de paiement
- Mention du format (ex : `Factur-X 1.0.06 BASIC`)

### 3. 🧩 Génération du format structuré (XML)

Créer un helper :
`lib/facture/generateFacturX.ts`

- Utiliser `xmlbuilder2` pour générer un XML conforme au **profil BASIC de Factur-X**.

- Exemple minimal :

  ```ts
  import { create } from "xmlbuilder2";

  export function generateFacturX(invoice) {
    const xml = create({ version: "1.0", encoding: "UTF-8" })
      .ele("rsm:CrossIndustryInvoice", { xmlns: "urn:factur-x:1p0:basic" })
      .ele("rsm:ExchangedDocument")
      .ele("ram:ID")
      .txt(invoice.number)
      .up()
      .ele("ram:IssueDateTime")
      .txt(invoice.issueDate.toISOString())
      .up()
      .up()
      .ele("rsm:SupplyChainTradeTransaction")
      .ele("ram:ApplicableHeaderTradeAgreement")
      .ele("ram:SellerTradeParty")
      .ele("ram:Name")
      .txt(invoice.user.companyName)
      .up()
      .ele("ram:SpecifiedLegalOrganization")
      .ele("ram:ID")
      .txt(invoice.user.siret)
      .up()
      .up()
      .up()
      .up()
      .end({ prettyPrint: true });
    return xml;
  }
  ```

- Sauvegarder ce XML sous `/public/invoices/{invoiceId}.xml`

### 4. 🧾 Génération du PDF + insertion du XML (Factur-X hybride)

- Créer `lib/facture/generatePdf.ts`
- Générer le PDF avec `pdfkit`.
- En option : insérer le fichier XML dans le PDF comme pièce jointe (pour respecter le format “Factur-X” complet).
- Ajouter un QR code ou mention “Facture électronique conforme Factur-X”.

### 5. 📤 Export et transmission

- Permettre à l’utilisateur :
  - de télécharger le **PDF**, le **XML**, ou les deux en ZIP.
  - d’envoyer la facture par mail au client (avec les deux fichiers en pièce jointe).

- API : `/api/invoices/export/[id]` → renvoie les deux fichiers.

### 6. 🗄️ Archivage et intégrité

- Chaque facture doit être conservée 10 ans.
- Stocker le hash SHA256 du PDF + XML pour prouver l’intégrité.
- Créer un script cron pour vérifier la validité des fichiers archivés.

### 7. 🔒 Sécurité & conformité

- Le fichier XML doit être non modifiable (readonly).
- Ajouter une signature électronique simple (hash + clé privée du serveur).
- Préparer une future intégration d’une signature qualifiée (QES) via API externe.

### 8. 🧠 Administration & e-reporting

- Créer un panneau admin `/dashboard/e-invoicing` pour :
  - Voir les factures conformes / non conformes
  - Exporter les données au format CSV/XML
  - Suivre le statut de transmission (non envoyé / en attente / archivé)

- Préparer un module futur d’interopérabilité avec le **Portail Public de Facturation (PPF)** via API.

### 9. ✅ Tests

- Créer des tests unitaires pour vérifier :
  - Structure XML valide selon le schéma Factur-X.
  - Présence de toutes les mentions légales.
  - Génération PDF et XML cohérente.

- Bonus : vérifier la conformité via un validateur XML open source.

### 10. 📦 Bonus (évolution future)

- Ajouter une option pour signer électroniquement les factures (QES / cachet électronique).
- Intégrer une API vers le futur Portail Public de Facturation.
- Permettre la transmission automatique (API mode “PDP-ready”).

## 🎁 Résultat attendu

Après implémentation, l’application doit :

- Générer pour chaque facture un **PDF conforme** et un **fichier XML structuré**.
- Les deux doivent être archivés et exportables.
- Les données doivent être valides selon le standard **Factur-X BASIC**.
- Préparer l’évolution vers l’émission automatisée (interopérabilité PDP).

---

```

```
