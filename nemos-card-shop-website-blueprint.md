# Nemo's Card Shop — Website Blueprint

**Prepared for:** Nemo's Card Shop (@nemoscardshop)
**Business summary:** Turns NFTs into physical, graded-style "slabbed" trading cards for individual collectors and NFT projects/communities.

*Note: no calendar timeline is included in this document — phases below reflect priority and scope, not scheduling.*

---

## 1. Project Overview & Goals

The site's job is to do three things a Twitter/X profile can't:

1. **Convert** — turn a follower or NFT holder into a paying customer with a clear, low-friction path to commission a card.
2. **Showcase** — give past work a permanent, browsable home (X threads get buried; a gallery doesn't).
3. **Operate** — give Nemo a real backend to manage orders, production status, and partnership inquiries instead of tracking everything in DMs.

**Success looks like:**
- Individual collectors can go from "I found this site" to "I placed an order" in one sitting.
- NFT projects/communities can find the partnership page and submit a bulk-order inquiry without DMing first.
- Nemo can update the gallery and see order status without needing a developer.

---

## 2. Target Users

| Persona | Need | Entry point |
|---|---|---|
| Individual NFT holder | Wants one physical card of their NFT | X link → Home → Commission flow |
| NFT project/community lead | Wants a branded drop for their whole holder base | Partnership page |
| Casual browser | Discovered via X, wants to see if the cards are legit/cool | Gallery |
| Past customer | Wants to reorder, check status, or share their card | Order status / Account |

---

## 3. Site Architecture (Sitemap)

```
Home
├── How It Works
├── Gallery (filterable by collection/style)
├── Shop / Drops
├── Commission a Card
│   ├── Step 1: Submit NFT / artwork
│   ├── Step 2: Choose style & tier
│   ├── Step 3: Preview
│   └── Step 4: Checkout
├── Project Partnerships
│   └── Partnership inquiry form
├── Order Status
├── About / Meet Nemo
├── FAQ
├── Community (X/Discord embeds, customer card check-ins)
├── Contact / Support
├── Cart / Checkout
├── Account (Phase 2)
└── Legal (Terms, Privacy, Shipping & Returns, IP Policy)
```

---

## 4. Page-by-Page Breakdown

**Home**
Hero with mascot art + one clear CTA ("Commission a Card" and a secondary "See the Gallery"). Below the fold: a rotating strip of recent cards, a condensed 3-step "how it works," social proof (cards produced, projects worked with), and a closing CTA banner.

**How It Works**
The full process explained visually: submit → choose style → preview → production → shipping. Include general production-time expectations (framed as typical ranges, not guarantees) and a link into FAQ for edge cases.

**Gallery**
Grid of completed cards, filterable by NFT collection, card style (cracked ice, holo, base), and whether it was a 1/1 or a batch drop. Each card entry shows the artwork, project tag, and — where available — a quote from the commissioner. Every entry links to "Get one like this."

**Shop / Drops**
For pre-made or limited-run cards not tied to a specific individual commission (e.g., a batch produced for a partnered project's whole community). Standard product grid with stock counts and a waitlist option for sold-out or upcoming drops.

**Commission a Card**
The core conversion flow (detailed in Section 5).

**Project Partnerships**
Pitch page aimed at NFT projects/DAOs, using past collabs (e.g., the Ape Reunion drop) as case studies. Includes a form: project name, collection size, intended use, budget range, timeline needs.

**Order Status**
Lookup by order number + email. Shows stage: Received → In Design → In Production → Shipped → Delivered, plus carrier tracking once shipped.

**About / Meet Nemo**
Founder story, mascot lore, links back to @heyitsnemo_. This is a trust page — collectors want to know there's a real person/operation behind a custom physical product.

**FAQ**
Must cover: what qualifies as a "card-able" NFT, whether ownership is verified, shipping cost/regions, returns/refunds on a custom product, reprint/multiples policy, and how IP/rights work (see Section 8).

**Community**
Embedded X feed, links to Discord if one exists, and a "card check-ins" wall where customers can submit photos of their card on arrival — this doubles as low-cost social proof and UGC content.

**Cart / Checkout**
Standard flow: shipping address, shipping method, payment. Order confirmation triggers an email and a tracking link.

**Legal**
Terms of Service, Privacy Policy, Shipping & Returns, and an **IP/rights disclaimer** — this is the one legal page that's non-optional for this business model (see Section 8).

---

## 5. Core User Flow: Commissioning a Card

1. **Submit** — Customer either connects a wallet (auto-detects owned NFTs) or manually pastes a contract address/token ID or uploads artwork directly.
2. **Choose style** — Card finish (cracked ice, holo, base), slab type, sizing, quantity (1/1 vs. multiples).
3. **Preview** — Customer sees a mockup of the final card before paying.
4. **Checkout** — Fiat payment (and optionally crypto) plus shipping details.
5. **Confirmation** — Order number issued, status trackable via Order Status page, automated email updates as it moves through production.

A second, lighter flow exists for **project partnerships**: inquiry form → manual quote/negotiation (this one intentionally stays human-handled rather than self-serve at launch).

---

## 6. Feature Set by Priority

**Core (needed to launch a functional site)**
- Home, How It Works, Gallery, About, FAQ, Contact, Legal pages
- Commission flow as a structured **form-based intake** (manual NFT/artwork submission — no wallet integration required yet)
- Shop/drops with basic cart + checkout (Stripe)
- Order status lookup
- Mobile-responsive design matching existing brand (dark theme, orange/black, mascot-driven)
- Email capture for updates/drops
- Lightweight admin view for Nemo to see and update incoming orders

**Phase 2 (meaningful upgrades once core is live)**
- Wallet-connect NFT auto-detection (pulls owned NFTs directly instead of manual entry)
- Live card preview/customizer
- Crypto payment option at checkout
- Customer accounts with order history and reordering
- Community "card check-in" submission wall
- Referral tracking for repeat/word-of-mouth customers

**Phase 3 (longer-range, only if the business scales into it)**
- Self-serve partnership portal with bulk pricing calculator
- On-chain "certificate of authenticity" (QR code on the slab linking back to the original NFT)
- Resale/trading marketplace between collectors who own the physical cards
- Loyalty or token-gated perks for repeat customers
- Multi-currency/international support

---

## 7. Technical Recommendations

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | Next.js + Tailwind CSS | Fast, SEO-friendly, easy to theme around existing brand |
| CMS | Headless CMS (e.g., Sanity) for gallery/blog entries | Lets Nemo add finished cards without a developer |
| Commerce | Stripe Checkout, or Shopify as backend if less custom dev is preferred | Stripe = full control; Shopify = faster to launch, less flexible |
| Web3 (Phase 2) | wagmi/RainbowKit for wallet connect, Alchemy or Moralis for NFT metadata lookup | Standard, well-supported libraries for read-only NFT detection |
| Database | Postgres (e.g., via Supabase) | Orders, gallery metadata, customer accounts |
| Shipping | Shippo or EasyPost API | Label generation + tracking numbers feed the Order Status page |
| Email | Postmark or Resend for transactional; Klaviyo/Mailchimp for marketing | Separate transactional reliability from marketing sends |
| Hosting | Vercel | Pairs natively with Next.js |
| Analytics | Plausible or GA4 + UTM tracking on X links | Measure the X → site → order funnel specifically |

---

## 8. Trust, Legal & Security Considerations

These matter more than usual for this business because it turns someone else's digital art into a physical product:

- **Ownership verification** — decide whether commissions require proof of NFT ownership (wallet-connect check) or run on trust/manual review at launch. This is a real fraud and reputation risk if skipped entirely.
- **IP / rights disclaimer** — Terms of Service should require the commissioner to confirm they hold the rights (as the NFT owner, under the project's license terms) to have the art reproduced physically. This protects Nemo's Card Shop from disputes with NFT project creators.
- **No custody of wallets/keys** — any wallet connection should be read-only (for detecting owned NFTs), never requesting private keys or seed phrases.
- **Payment security** — use Stripe/established processors; never store raw card data.
- **Refund policy** — because these are made-to-order physical goods, the policy should be explicit that production-started orders are generally non-refundable, communicated clearly before checkout.

---

## 9. Design Direction

- Carry over the existing brand identity directly: black/orange palette, the current logo lockup, and the penguin mascot in its various poses.
- Dark-mode-first UI (matches the X profile's look and the audience's expectations coming from there).
- Trading-card visual motifs throughout — card-frame borders, foil/holo texture accents, "slab case" styling used for testimonials or featured gallery pieces.
- Bold, slightly playful display type for headlines; clean sans-serif for body copy and commerce flows (checkout should feel trustworthy, not overly stylized).
- Mobile-first: this audience arrives from the X app on a phone far more than desktop.

---

## 10. Content Nemo Needs to Provide

- High-resolution photos (ideally short videos too) of every card produced, for the gallery
- Logo files and mascot art in multiple poses/formats
- Pricing structure per style/tier
- Realistic production-time expectations
- Shipping regions and costs
- Refund/returns stance
- Bio and background for the About page
- Any existing customer testimonials, or a plan to start collecting them
- A decision on the ownership-verification question (Section 8)

---

## 11. Open Questions to Resolve With the Client

- Wallet-verified ownership at commission time, or trust-based intake for now?
- Fiat only at launch, or crypto payments from day one?
- International shipping, or domestic-only to start?
- Flat-rate pricing or tiered by style/rarity?
- Fully custom build vs. a Shopify-based hybrid — affects both cost and how much Nemo can self-manage later?
- Should partnership/bulk inquiries stay fully manual (form → DM/email), or does he want a self-serve quote calculator eventually?

---

## 12. Admin / Operations Needs

- Order dashboard: incoming requests, status updates (Received → Design → Production → Shipped → Delivered)
- Simple gallery upload flow so finished cards can be added without dev involvement
- Basic inventory tracking for shop/drop items
- A lightweight pipeline for partnership inquiries (even a simple table is fine at first)
