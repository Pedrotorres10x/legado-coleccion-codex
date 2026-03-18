# SEO Landing Feed Audit

Date: 2026-03-16

## Purpose
This audit checks which SEO landing pages are currently supported by live CRM inventory and which ones are acting mainly as SEO-support pages while the feed remains thin.

The goal is not to judge the landing strategy itself. The goal is to understand where the current feed is commercially strong, where it is only partially supportive, and where the UX must avoid dead ends.

## Method
- Source checked: public CRM properties feed
- Snapshot used: live feed response on 2026-03-16
- Matching method:
  - exact `city` filters where appropriate
  - alias matching for naming variants such as `Alicante (Alacant)`, `La Vila Joiosa`, `La Nucia`, `Javea`
  - `zone` matching for places that live under broader cities such as `Orihuela Costa`, `Ciudad Quesada`, `Moraira`
- Important caveat:
  - the feed snapshot only returned around 50 national properties at audit time
  - this means the audit reflects current stock concentration, not long-term search value

## Feed snapshot

### Strongest cities in the live feed
- `Torrevieja`: 8
- `Pilar De La Horadada`: 8
- `Rojales`: 6
- `Guardamar Del Segura`: 3
- `San Miguel De Salinas`: 3
- `Orihuela`: 3
- `Calpe`: 2
- `Finestrat`: 2
- `Javea`: 1

### Strongest zones in the live feed
- `Torrevieja`: 8
- `Pilar De La Horadada`: 7
- `Ciudad Quesada`: 5
- `San Miguel De Salinas`: 3
- `Guardamar Del Segura`: 3
- `Finestrat`: 2
- `Calpe`: 2
- `Orihuela Costa`: 2

## Landing coverage status

### Tier A: strong enough for live-inventory-led UX
These pages currently have enough support from the feed to behave like genuine listing-first commercial pages.

| Landing | Current matches |
|---|---:|
| `/property-for-sale-alicante-province` | 50 |
| `/property-for-sale-torrevieja` | 8 |
| `/property-for-sale-pilar-de-la-horadada` | 8 |
| `/property-for-sale-rojales` | 6 |
| `/property-for-sale-ciudad-quesada-rojales` | 5 |

### Tier B: workable but thin
These pages are valid and usable, but the feed is currently light enough that they should be treated as hybrid landing pages, not pure inventory pages.

| Landing | Current matches |
|---|---:|
| `/property-for-sale-guardamar-del-segura` | 3 |
| `/property-for-sale-san-miguel-de-salinas` | 3 |
| `/property-for-sale-finestrat` | 2 |
| `/new-build-property-finestrat` | 2 |
| `/property-for-sale-orihuela-costa` | 2 |
| `/new-build-property-orihuela-costa` | 2 |
| `/property-for-sale-calpe` | 2 |
| `/property-for-sale-javea` | 1 |

### Tier C: currently SEO-support pages only
These pages make sense in the architecture, but right now the feed does not give them enough stock to behave like true commercial inventory landings.

| Landing | Current matches |
|---|---:|
| `/property-for-sale-benidorm` | 0 |
| `/apartments-for-sale-benidorm` | 0 |
| `/sea-view-apartments-benidorm` | 0 |
| `/property-under-200k-benidorm` | 0 |
| `/property-for-sale-altea` | 0 |
| `/villas-for-sale-altea` | 0 |
| `/property-for-sale-alicante-city` | 0 |
| `/property-for-sale-cabo-roig` | 0 |
| `/property-for-sale-campoamor` | 0 |
| `/property-for-sale-la-zenia` | 0 |
| `/property-for-sale-villamartin` | 0 |
| `/property-for-sale-playa-de-san-juan` | 0 |
| `/property-for-sale-el-campello` | 0 |
| `/property-for-sale-santa-pola` | 0 |
| `/property-for-sale-villajoyosa` | 0 |
| `/property-for-sale-la-nucia` | 0 |
| `/property-for-sale-alfaz-del-pi` | 0 |
| `/property-for-sale-moraira` | 0 |
| `/property-for-sale-denia` | 0 |

## Interpretation

### What is working
- The province hub is valid because it maps to the full live feed.
- The south Alicante cluster is currently the real commercial core of the feed.
- `Torrevieja`, `Pilar de la Horadada`, `Rojales`, `Ciudad Quesada`, `Guardamar` and `San Miguel de Salinas` are the most defensible zone pages from a live-stock perspective.
- `Finestrat` also remains viable, even with thin inventory, because the product and intent still align clearly.

### What is not a landing problem
- Benidorm, Altea, Alicante City and the north-coast lifestyle pages are not necessarily bad SEO bets.
- They are simply not supported by the current live feed snapshot.
- In other words: the architecture is broader than the current stock footprint.

### What this means commercially
- Some pages should currently be understood as conversion-support pages, not direct listing-led money pages.
- Their job is to capture intent, explain the 360 proposition, and route users to nearby live inventory or the wider catalogue.
- The recent UX changes to avoid empty dead ends are therefore the right move.

## Recommended operating model

### Keep as primary money pages
- `/property-for-sale-alicante-province`
- `/property-for-sale-torrevieja`
- `/property-for-sale-pilar-de-la-horadada`
- `/property-for-sale-rojales`
- `/property-for-sale-ciudad-quesada-rojales`

### Keep live, but treat as hybrid landings
- `/property-for-sale-guardamar-del-segura`
- `/property-for-sale-san-miguel-de-salinas`
- `/property-for-sale-finestrat`
- `/new-build-property-finestrat`
- `/property-for-sale-orihuela-costa`
- `/new-build-property-orihuela-costa`
- `/property-for-sale-calpe`
- `/property-for-sale-javea`

### Keep indexed, but treat as SEO-support pages
- Benidorm commercial pages
- Altea pages
- Alicante City and Playa de San Juan
- microzones with zero current stock
- north-coast selective markets with zero current stock

These pages should keep:
- strong explanatory copy
- strong “related areas” routing
- strong links to the wider catalogue
- clear 360 value proposition

They should not rely on the feed block as the main commercial proof point until stock improves.

## Highest-priority next actions

1. Promote the true feed-backed money pages harder from the home page, catalogue and internal links.
2. Keep zero-stock pages live, but continue treating them as guidance-plus-routing pages.
3. Consider adding a stronger “nearby live opportunities” block for zero-stock landings.
4. Re-run this audit regularly, because the right money-page set should follow live coverage, not just keyword logic.

## Practical conclusion
The SEO architecture is broader than the current CRM inventory, and that is acceptable as long as the UX handles it honestly.

Right now, the feed-backed commercial heart of the project is mostly in the south Alicante cluster plus Finestrat and a small amount of Calpe and Javea stock.

That means the smartest next move is not to create more pages. It is to double down on:
- better routing from thin pages to strong pages
- stronger merchandising of the feed-backed hubs
- and periodic review of which landings are truly commercial versus primarily supportive.
