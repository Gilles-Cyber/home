import { Product } from '../types';
import { HERO_BGS, GENERATED_IMAGES } from '../assets/generated_images';

// Verified TCGplayer CDN IDs for authentic booster boxes
const TCG_IDS = {
    surgingSparks: 565606,
    p151Bundle: 502000,
    rebelClash: 211756,
    battleStyles: 233041,
    obsidian: 501257,
    twilight: 543846,
    temporal: 536225,
    stellarCrown: 557354,
    op13: 628352
};

const tcgImg = (id: number) => `https://product-images.tcgplayer.com/${id}/400w.jpg`;

// Assets from images.html admin dashboard
const ADMIN_IMGS = {
    upc151: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxsSSCkmvethIR3xYPQKbUvG4r4rkZs93nL_U3GpN4IC6mE_Def1p-y8B3rpQqqvtgQFQV-iJ8rd_JjoM1rto5ytNArRhHINYQ7VME0fQzV9_GcrSx79FrQRDKVv9pkX1I4UbQDmmV4VVh-SsyrzUqRRYPSCOCnyKd5f4QB5XVhGoguYivGKwM-ZERnLSyhGG8X5o1DuifMwLsODnRUxFfiWII_Lk22dlzfqQXP80reXKw1dphluvZk1hG2qMtYXbz1UvrN53uI_u5",
    charizardSIR: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIEnrKf5UkQEjyfHdYZ9nf1vJDw-Xtq8sxSJbZ8CpXXnwRADJemnCK7Ubd5XBKdMRg2V5UlJFR6qamf_b_r4J-yYZEW0apEdsFFjBUdDha2kKdiSgKyRs-UhB7-dIsj89RNKZ6Uj1rrI7XJEoEvRoGhQ6BeE05VoC8mUrfPGiWiBeadwXVnEIQaG9zfA86yO8I0aOnCX7B6SySD3S9Mx4FaTVLs5238HmAXaF58XjybU43nJO4PgEo3jzUZcPKkb5vEiHL8hUsOPyC",
    paldeaBox: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRGCcd3jNzv4l0UYJtVfQMPEPe-fjNA6JJ0FWcNNiuESMXPahuDuo28drqbaxBn3p_5zrh6Ro39QYp8dQp8Vx5KKIqWCYxllqUrmnzS-fhTgWHaQ1KpcnGJrpkFkfu2KR7Fh5_nLkbcop4292iOnvf2f0Uh42X1IML_fG1KbHUtkmQmBVv_bIX6DOAs8YPMt5ao4KR8FQiUT4lKVpAiiNf4rMVKQB3ELgSyzjkn4CFo7T_I_P6n9Z5YiHQEUWdI15W9yeTQb1bswlc",
    zapdosSIR: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8Mo4fWXKxjhfdlU1aWs-XyCdTbPToPNlSOyLryAqoJUoHIh9dLtDS7W5bXzCJPACCud-i-UVvUioTCePQtTUITODzCrG3qxz3NMZOiyAUomN6gIZlezWMZ7OpE8G55i9cv_sdhYhWwSxGOsptAnRSPuJDOfhp4d_-AkIdHdzgBoPSor8fTnyavHChI5Keor2Y6citD2hSx9C7weGGpwXazL9rQNrTnpNb118L5L5GI36v5Zril84FVdj9EpZViHqGx7TbnFxSNw1B"
};

// Assets from 'home pages images.html' variant
const HOME_VARIANT_IMGS = {
    megaCharizard: "https://lh3.googleusercontent.com/aida-public/AB6AXuARX7se7s5FZb0Yk08V-vpFvHFxPtigxSaLaBok9rNdj6etHNb16vis9FBKr8MeSSEB8j9FqLkZ5VVSdOOr12cq6j4JT1jF7MGSgvGnf_Unz_-cuSZ1pyjPgu-TPP9v9hi2FWERYyk79kJaM4m9vFKvMU9bs-fpkhmra7Ir3slycuI4MkrYbcRBBmhUJgtuAzftM0Zjg8076vSPXSr1OAX0xJdstsshrsbn4OAoAw8C40OiIjj4hdFRCCPm7BHik7ZCOIhUilF4_ek",
    temporalForces: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtDU-4WRAG9dJMh0S2SfXr-Pm_RuAjWynDpw1U9pif4kvLVoyOUkuGomVLRtsoRBNDAn9YwgitmKaxjBV06BChShJit2nH-6fpOFziJTVmMverYiK4hnJ0Bin7QxRcHO3seVlL7oIg3MzXIF-faYnCeXJU96O80pNLj-ufQV4JRC4N-fJbmDuE2wxQEssqqhfF_43Lxs-bfNdqIu9lLTQtRSUhP7Wx59bnCV3gSVh5fVQGr9Qf_o99rsd7LEWCeHf9w2lQOVnXTio",
    teamRocket: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9YJbamgpUrQ8gUE3vUpPmR2cE7HmZCsu2_KZE6SZsFBcDnYQWxO1leacsJ1ZYwKjxFMZHVHyGq37kABqvBPqP54GnoUzrgHFHpeSn1ZgwsSUsF5_eIs-OJ3F_-KNfDjrHDtpNb9iP9rF1Vfc8VX2vfierFG52UP4qeszccGe_1uvmxcZW79FeB2ELAyuJUt3b5w991-_EiPWlbsFxicEo0wzi2qGbwNgtvwHCujtp4UfY8jxg5nZ1CG_0ykNA1--5I9HwQarQk7s",
    mewtwoStrikes: "https://lh3.googleusercontent.com/aida-public/AB6AXuDj2USPIU80QUcEnTX49rtvqtavW9NODtlYl_cYN3M16aql6Tq7cxN9Ihfp6Oncy59quudIkApOHaecx-pr-4ddolP8Lzf8sl1d5DDJBsXmazfxizOSzntXSUG4OKltSOxAmcPMOqTN8IE2GMqsvJd4MqYgQxCqqzbqjsTgWQfigfhy6_lzMlSolUT-WIFAOLKCZnUSlZSGiSAuR-zSpSMnmO0nPIAEDggQ8HsWhLHdBC5XFy9UMfvuuyjKsGhC1D4obQdwzIj4LgA",
    psaLugia: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbTZy44VA58PSOiqKSP-oDKtthk0_EKY1XbUlwU_XQyXdi7gCvz3H7kK-QQJhK1mbBr363f873DUaPZaIOUsR8BZ5pPsHpcTRjwRf8asHU0S_8pJbBtPdWkJTXV8HtFl49Gv59Gvw58ApF3c-ZEaJNZkuoXEL76hm8NHWp2a7oCAHw5vZPFNHCXv4RWxGwL05QqaU0QsQq6qH1mEmcJLN2xxRC01W9ZinmX3zRaib6z_qu18I4PuF5tZjwzvQJkFT59x8ji8MNmUI",
    // New assets from user update
    stellarVariant: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX2mxJfoC0LB9kxJ8L0CjtT9ma-ncjwvin_0X2Jq2pGN-ATttTJWH6ltnfwSb76t4jy03vwyC7PD8HXws_Z6oxpGs2CGjoV5n-PviXQrfjZwV9m1o5Xyjky_xabtI-o7IUztRtMAQGcJ0enQgmb5-JqdVy-EVbsAdXLnCz7pTpJpfXruOcqkDPYTDF4dacc7zWldmvXrdpmPm61ZTsLYOewCMDliE44Pb6jTD0FlKkPyxPevVQ8sk7kCXiVcLjw8Exsj5YISdZ1MM",
    ancientVariant: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFQ1chZlefhjPf8KHvq_BI0UrRA9zqcM5DOJfiM3NH7g8XD83Jgy-yclrXepmtlITdwFnQ9hAr_3hNQ0FJdsR6rszO9O2RMAV3ePegrTSbmyPNsgpqrv-JMRHgLtryensit4S8ItbVIwYIJFRsb1Ip8XRWZ6fDGXCrt4UgNStInZ8xNmIvVwJuP1DMtT_x1tEeSKXT9uow13dukshskRjTenef2dCvfZR0mBGztSqxEXWZImW1ybdVbCQI2yootvlwntlhhC_9_JA",
    galaxyVariant: "https://lh3.googleusercontent.com/aida-public/AB6AXuASuxP3_N7XeoPvnwY3Nw2Z5I9zVj_Ei37kCRkl1rbRUxLSB0QBy88uf3WQUom4MUf-IPDfjtbBlO-coZQGEEgrp48PABXvW0cEktFX7rDYY4uYBPbA-edy2ZHOoDXhNwt6LxlNa8Z_FD1fMC05EcYDdmZDS6s6tMhUl3b4nC9w16cO6U3axmOo7JUwgjab9KCGAP_YOmk4joAJ7CJCdmdn7OJ1e5Q9h19CwGzG9i5Ns3I3Fh4OKsDHeK6-pSXTkC6Mpt1uMrmURjk",
    shinyVariant: "https://lh3.googleusercontent.com/aida-public/AB6AXuB73k57hYy7KAPSZVm7YPATMBmR4Ar0SGSueN_7f60pXW1vaqn677SvFX0YrKrfEGBWcxAQdlu5ovIUGmcZldRicQ10XWxATw6AmYYMvLoqL62_W8KALr52rCcBWBv7-akEa1tSmlDOrk7LcGpIxGLJd-QyqL4vdP9RR-AbG_oXvxz8J6dB29XVAI7_N4tMaJ-vyicuK0xsonDB440tkVib_Ln3lTzUig60HWAdattI_pJeSOQ3BwPX1Fz-WpkGLjrlQewtNnGp4M0",
    ultraVariant: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_fcO04dRUib6ELASPyvmuyyVoVvgM4B75fdCJnbFM5z4ZTZXpc7QJNreYAI9fTKe203Of8TQ6FAscErbC85smSFjIWZU7fHVUcvAHaFLPbn4S4tbg3Lu4cPobn7MILCTou0E3wfFqyeMEvy7EjQmcDLFdYcUfRUwISf8psUEC-TyJeBx_VBN5FsGLdeSqysgNPmzXdDyVvhM0EOuX_3IQr3WwnvneYo2P6_Qwv3Dtko2_mM1VmL08rbxgwPVrlsQKzCIsn_iZqnk",
    deltaVariant: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0zNUwmRHpTOjokAWeJ2EHaQYJ-gz4AlOnGd862dus1bSpVvps0XwpV_tt9kBMSQdt4kdAP3FYblmEK7xrfjmf-rbcuHDMuk0MbgqCdH6K0HzHotngUJ3bhGYuRQdfY19G6M_VIcF2GzvicC5KdV-KpqbWl3SbxifGx2PjjrCfrZ_CzRyYPZd1CHRJ-eywqo9zy2eAiGmOD5bSXwYSExVIpjEYSNvwKmGw0BfPx46EUwomkhx4tsALNCF-EHYa_el12WQGZvDOllI"
};

// Premium high-resolution TCG product images and local assets
const IMGS = {
    // Authentic Booster Box/Bundle URLs
    surgingSparks: tcgImg(TCG_IDS.surgingSparks),
    p151Bundle: tcgImg(TCG_IDS.p151Bundle),
    rebelClash: tcgImg(TCG_IDS.rebelClash),
    op13: tcgImg(TCG_IDS.op13),
    stellarCrown: tcgImg(TCG_IDS.stellarCrown),
    twilight: tcgImg(TCG_IDS.twilight),
    obsidian: tcgImg(TCG_IDS.obsidian),
    temporal: tcgImg(TCG_IDS.temporal),
    battleStyles: tcgImg(TCG_IDS.battleStyles),

    // Admin imagery from images.html
    admin1: ADMIN_IMGS.upc151,
    admin2: ADMIN_IMGS.charizardSIR,
    admin3: ADMIN_IMGS.paldeaBox,
    admin4: ADMIN_IMGS.zapdosSIR,

    // Featured variants from home pages images.html
    variant1: HOME_VARIANT_IMGS.megaCharizard,
    variant2: HOME_VARIANT_IMGS.teamRocket,

    // Fallback/Local Premium assets for custom sets
    hero1: HERO_BGS[0],
    hero2: HERO_BGS[1],
    hero3: HERO_BGS[2],
    hero4: HERO_BGS[3],
    hero5: HERO_BGS[4],
};

export const PRODUCTS: Product[] = [
    { id: 1, name: "Surging Sparks Booster Box", price: 220.00, category: "booster", badge: "HOT", image: IMGS.surgingSparks, description: "36 booster packs featuring Pikachu ex and powerful Thunder-type Pokémon. One of the most sought-after sets in the Scarlet & Violet era.", stock: 12 },
    { id: 2, name: "Scarlet & Violet 151 Booster Bundle", price: 35.00, category: "bundles", badge: "NEW", image: IMGS.p151Bundle, description: "A bundle of boosters celebrating the original 151 Pokémon. Perfect for collectors chasing Mew ex or Alakazam ex.", stock: 48 },
    { id: 3, name: "Destined Rivals Booster Box", price: 180.00, category: "booster", image: IMGS.hero1, description: "Brand new rivalry-themed set featuring iconic rival Pokémon battles and brand new Trainer cards.", stock: 22 },
    { id: 4, name: "Journey Together Enhanced Booster Box", price: 160.00, category: "booster", image: IMGS.hero2, description: "A heartwarming set celebrating the bond between Trainer and Pokémon. Includes exclusive alt-art illustrations.", stock: 18 },
    { id: 5, name: "Journey Together Elite Trainer Box", price: 50.00, category: "etb", image: IMGS.hero3, description: "9 booster packs, 65 card sleeves, a player's guide, and premium accessories — all in the Journey Together theme.", stock: 35 },
    { id: 6, name: "Rebel Clash Booster Box", price: 350.00, category: "booster", badge: "VAULT", image: IMGS.rebelClash, description: "Classic Sword & Shield era box with powerful V and VMAX Pokémon. A highly sought vintage box from the golden era.", stock: 4 },
    { id: 10, name: "Temporal Forces Booster Box", price: 210.00, category: "booster", image: IMGS.temporal, description: "Iron Crown ex and Walking Wake headline this time-travel themed set with Ancient and Future Pokémon.", stock: 20 },
    { id: 7, name: "Battle Styles Booster Box", price: 205.00, category: "booster", image: IMGS.battleStyles, description: "Features Pokémon with Single Strike and Rapid Strike styles. Home of Urshifu VMAX and Empoleon V.", stock: 9 },
    { id: 8, name: "Twilight Masquerade Booster Box", price: 230.00, category: "booster", image: IMGS.twilight, description: "A mysterious festival-themed set featuring Ogerpon ex in all its fabulous forms and new Illustration Rare cards.", stock: 14 },
    { id: 9, name: "Obsidian Flame Booster Box", price: 240.00, category: "booster", image: IMGS.obsidian, description: "Features Charizard ex in its terrifying Tera Form — one of the most popular Scarlet & Violet sets.", stock: 7 },
    { id: 11, name: "Stellar Crown Booster Box", price: 210.00, category: "booster", image: IMGS.stellarCrown, description: "The Tera Stellar mechanic debuts here. Pull from over 240 cards including Stellar Rare Hitmonlee.", stock: 16 },
    { id: 12, name: "OP-13 Booster Box", price: 260.00, category: "booster", badge: "RARE", image: IMGS.op13, description: "One Piece TCG OP-13 set packed with powerful new attacks for your favorite Straw Hat crew members.", stock: 5 },
    { id: 13, name: "Prismatic PC ETB", price: 160.00, category: "etb", badge: "LIMIT", image: IMGS.hero4, description: "The Prismatic Evolutions Premier Collection — 11 packs, an exclusive Eevee promo, and rainbow accessories.", stock: 3 },
    { id: 14, name: "Phantasmal Flames Booster Box", price: 180.00, category: "booster", image: IMGS.hero5, description: "Supernatural flames and ghost-type Pokémon with some of the best alt-arts of the year.", stock: 25 },
    { id: 15, name: "Phantasmal Flames ETB", price: 120.00, category: "etb", image: IMGS.hero3, description: "9 Phantasmal Flames booster packs, custom damage counters, and a full-art foil promo card.", stock: 11 },
    { id: 16, name: "Phantasmal Mega Charizard UPC", price: 130.00, category: "special", badge: "ELITE", image: IMGS.hero1, description: "Ultra Premium Collection — 16 packs, a metal coin, a Pikachu figure, and premium sleeves. The crown jewel.", stock: 6 },
    { id: 17, name: "Blooming Waters Booster Box", price: 75.00, category: "booster", image: IMGS.hero2, description: "A Water and Grass type themed mini-set with relaxing artwork and beautiful full-art Pokémon.", stock: 30 },
    { id: 18, name: "151 PC ETB", price: 150.00, category: "etb", image: IMGS.hero4, description: "Jigglypuff exclusive promo, 61 card sleeves, and 11 booster packs of the beloved 151 set.", stock: 8 },
    { id: 19, name: "Costco Prismatic Evolutions 8-pack Tins", price: 100.00, category: "bundles", image: IMGS.hero5, description: "Exclusive Costco bundle: 8 mini tins packed with Prismatic Evolutions boosters. Limited club store stock.", stock: 15 },
    { id: 20, name: "151 UPC", price: 130.00, category: "special", image: IMGS.hero1, description: "The 151 Ultra Premium Collection with a Mew VMAX figure, metal coins, and 16 booster packs. A centerpiece.", stock: 7 },
    { id: 21, name: "Mega Evolution Booster Box", price: 180.00, category: "booster", image: IMGS.hero2, description: "Classic XY-era mega evolution set. Features Mega Charizard X and Y in stunning full-art holofoil.", stock: 10 },
    { id: 22, name: "Mega Evolution Lucario ETB", price: 80.00, category: "etb", image: IMGS.hero3, description: "Lucario-focused ETB from the Mega Evolution series with 10 booster packs and premium accessories.", stock: 20 },
    { id: 23, name: "Black Bolt Elite Trainer Box", price: 70.00, category: "etb", image: IMGS.hero4, description: "Darkrai-themed ETB with noir-style card back designs and 9 booster packs from classic Dark sets.", stock: 13 },
    { id: 24, name: "Prismatic Lucario & Tyranitar Sams Club", price: 100.00, category: "special", image: IMGS.hero5, description: "Exclusive Sam's Club bundle: Lucario and Tyranitar promo cards, plus 6 Prismatic Evolutions packs.", stock: 9 },
];

export const CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'booster', name: 'Booster Boxes' },
    { id: 'etb', name: 'Elite Trainer Boxes' },
    { id: 'bundles', name: 'Bundles & Tins' },
    { id: 'special', name: 'Special Collections' },
];

export const FEATURED_IMAGES = [
    ...HERO_BGS,
    GENERATED_IMAGES.splash,
    ADMIN_IMGS.upc151,
    ADMIN_IMGS.charizardSIR,
    ADMIN_IMGS.paldeaBox,
    ADMIN_IMGS.zapdosSIR,
    HOME_VARIANT_IMGS.megaCharizard,
    HOME_VARIANT_IMGS.temporalForces,
    HOME_VARIANT_IMGS.teamRocket,
    HOME_VARIANT_IMGS.mewtwoStrikes,
    HOME_VARIANT_IMGS.psaLugia,
    HOME_VARIANT_IMGS.stellarVariant,
    HOME_VARIANT_IMGS.ancientVariant,
    HOME_VARIANT_IMGS.galaxyVariant,
    HOME_VARIANT_IMGS.shinyVariant,
    HOME_VARIANT_IMGS.ultraVariant,
    HOME_VARIANT_IMGS.deltaVariant
];
