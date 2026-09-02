// ─────────────────────────────────────────────────────────────────────────────
//  defaultContent.js
//  ALL site content lives here as the factory-reset default.
//  The Owner Panel reads/writes to localStorage key "kg_content".
//  On first visit, if localStorage is empty, this data is loaded automatically.
//  Owner can edit EVERYTHING from /kgadmin-9x2 and reset to this any time.
// ─────────────────────────────────────────────────────────────────────────────

const defaultContent = {

  // ── GYM INFO ──────────────────────────────────────────────────────────────
  gym: {
    name:        'Knockout Gym',
    tagline:     'Where Champions Are Forged.',
    address:     'SCO 128, 1st Floor, Main Patiala Road, Near Canara Bank, Zirakpur, Punjab 140603',
    phone:       '085828 59970',
    email:       'knockoutgym@gmail.com',
    rating:      '4.9',
    reviews:     '364',
    totalMembers:'500',
    years:       '6',
    instagram:   '',
    facebook:    '',
    whatsapp:    '918582859970',
    // Paste a Google Maps embed URL here (from maps.google.com → Share → Embed)
    mapEmbed:    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3431.4!2d76.85!3d30.64!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDM4JzI0LjAiTiA3NsKwNTEnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890',
    hours: {
      weekdays: '5:30 AM – 10:00 PM',
      sunday:   'Closed',
    },
  },

  // ── HERO SECTION ──────────────────────────────────────────────────────────
  hero: {
    line1:   'WHERE CHAMPIONS',
    line2:   'ARE FORGED.',
    subtext: "Zirakpur's #1 Fitness Destination · Est. 2019",
    ctaText: 'Join Now',
    // Leave videoUrl blank = shows animated CSS background (still looks great)
    // To add video: paste direct MP4 link OR place file in public/videos/hero.mp4
    // and type:  /knockout-gym/videos/hero.mp4
    videoUrl: '',
    // Fallback image URL if no video (paste any gym image URL)
    bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  },

  // ── STATS ─────────────────────────────────────────────────────────────────
  stats: [
    { value: '500', suffix: '+', label: 'Members' },
    { value: '4.9', suffix: '★', label: 'Rating'  },
    { value: '6',   suffix: '+', label: 'Years'   },
    { value: '364', suffix: '',  label: 'Reviews'  },
  ],

  // ── OWNER PROFILE ─────────────────────────────────────────────────────────
  owner: {
    name:   'Gurpreet Singh',
    title:  'Head Coach & Founder',
    bio:    'Gurpreet Singh started Knockout Gym in 2019 with a single vision — to build a space where every person, regardless of fitness level, could unlock their true potential. A competitive athlete with over a decade of training experience, Gurpreet has represented Punjab at national-level competitions and brought home titles that reflect years of discipline and hard work. His coaching philosophy is simple: consistency over intensity, form over ego, and character over trophies.',
    image:  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    achievements: [
      { title: 'Punjab State Bodybuilding Championship', year: '2023' },
      { title: 'North India Fitness Open — Gold',        year: '2022' },
      { title: 'Chandigarh Regional Classic — Silver',   year: '2021' },
      { title: 'Zirakpur Fitness Cup — Gold',            year: '2020' },
    ],
  },

  // ── GYM STORY TIMELINE ────────────────────────────────────────────────────
  story: {
    heading: 'The Knockout Story',
    intro:   'Every great gym has a founding moment. Ours started with a small space, a big vision, and the belief that Zirakpur deserved a world-class fitness destination.',
    timeline: [
      {
        year: '2019',
        heading: 'The First Step',
        text: "Knockout Gym was founded with just 400 sq ft of space and a handful of equipment. Gurpreet Singh invested his competition savings into building a gym he wished had existed when he started training. The early days were tough — word spread slowly, members were few — but every session was treated like a championship bout.",
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      },
      {
        year: '2020',
        heading: 'Growing Through Challenges',
        text: "The pandemic tested every gym in the country. Knockout Gym pivoted fast — launching online training sessions before most gyms knew what Zoom was. Members stayed loyal. When restrictions lifted, the gym reopened to a bigger community than it had before closing. The challenge had made us stronger.",
        image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&q=80',
      },
      {
        year: '2021',
        heading: 'First Competition Win',
        text: "Gurpreet entered the Chandigarh Regional Classic and brought home a silver. But more importantly, three Knockout Gym members competed for the first time — and all three placed. The gym was no longer just a place to train. It was producing athletes.",
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      },
      {
        year: '2022',
        heading: 'Championship Season',
        text: "The North India Fitness Open. Gurpreet took gold. The gym floor exploded. Knockout Gym's reputation as a serious training facility was cemented. Membership requests tripled. A waiting list formed for the first time. We expanded to a second hall and added professional cardio equipment.",
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
      },
      {
        year: '2023',
        heading: 'State Champions',
        text: "Punjab State Bodybuilding Championship — and Gurpreet took the top title. The gym celebrated like it was a festival. Five members also competed that year, with two podium finishes. Knockout Gym was officially on the Punjab fitness map. Google reviews crossed 300, rating held at 4.9.",
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      },
      {
        year: 'Today',
        heading: '500+ Members Strong',
        text: "Over 500 active members. 364 Google reviews averaging 4.9 stars. Online classes. Professional trainers. A community built on discipline, respect, and results. Knockout Gym isn't just the best gym on Patiala Road — it's a movement.",
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      },
    ],
  },

  // ── BEFORE / AFTER RESULTS ────────────────────────────────────────────────
  results: [
    {
      id: 1,
      name:     'Arjun Sharma',
      before:   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
      after:    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      result:   '-18 kg',
      duration: '3 Months',
      type:     'weight-loss',
    },
    {
      id: 2,
      name:     'Rahul Verma',
      before:   'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&q=80',
      after:    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
      result:   '+12 kg Muscle',
      duration: '5 Months',
      type:     'muscle-gain',
    },
    {
      id: 3,
      name:     'Priya Kaur',
      before:   'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80',
      after:    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&q=80',
      result:   '-22 kg',
      duration: '4 Months',
      type:     'weight-loss',
    },
    {
      id: 4,
      name:     'Manpreet Singh',
      before:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      after:    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
      result:   'Full Transformation',
      duration: '6 Months',
      type:     'transformation',
    },
  ],

  // ── GALLERY ───────────────────────────────────────────────────────────────
  gallery: [
    { id: 1, url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', caption: 'Main Training Floor',    category: 'gym'       },
    { id: 2, url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', caption: 'Weight Section',         category: 'equipment' },
    { id: 3, url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', caption: 'Competition Day 2023',    category: 'competitions' },
    { id: 4, url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', caption: 'Cardio Zone',           category: 'equipment' },
    { id: 5, url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&q=80', caption: 'Functional Training',  category: 'gym'       },
    { id: 6, url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', caption: 'Morning Session',      category: 'moments'   },
    { id: 7, url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', caption: 'Coach Gurpreet',        category: 'moments'   },
    { id: 8, url: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80', caption: 'Championship Pose',     category: 'competitions' },
    { id: 9, url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80', caption: 'Ladies Section',        category: 'gym'       },
    { id:10, url: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&q=80', caption: 'Member Achievement',   category: 'moments'   },
  ],

  // ── TROPHIES ──────────────────────────────────────────────────────────────
  trophies: [
    { id: 1, image: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=600&q=80', title: 'Punjab State Championship',        year: '2023', level: 'Gold'   },
    { id: 2, image: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=600&q=80', title: 'North India Fitness Open',          year: '2022', level: 'Gold'   },
    { id: 3, image: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=600&q=80', title: 'Chandigarh Regional Classic',       year: '2021', level: 'Silver' },
    { id: 4, image: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=600&q=80', title: 'Zirakpur Fitness Cup',              year: '2020', level: 'Gold'   },
    { id: 5, image: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=600&q=80', title: 'Best Gym — Punjab Fitness Awards', year: '2023', level: 'Award'  },
  ],

  // ── MEMBERSHIP PLANS ──────────────────────────────────────────────────────
  membership: [
    {
      id: 1,
      name:     'Basic',
      price:    '1,000',
      period:   'month',
      badge:    '',
      features: [
        'Full gym access',
        'Locker facility',
        'Cardio equipment',
        'Mon–Sat, 5:30 AM – 10 PM',
      ],
    },
    {
      id: 2,
      name:     'Standard',
      price:    '1,500',
      period:   'month',
      badge:    'Most Popular',
      features: [
        'Everything in Basic',
        'Personal trainer — 2×/week',
        'Diet consultation',
        'Progress tracking',
        'Online class access',
      ],
    },
    {
      id: 3,
      name:     'Premium',
      price:    '2,500',
      period:   'month',
      badge:    '',
      features: [
        'Everything in Standard',
        'Personal trainer — daily',
        'Custom meal plan',
        'Competition prep support',
        'Priority booking',
        'Guest passes (2/month)',
      ],
    },
  ],

  // ── ABOUT SECTION SNAPSHOT (on Home page) ─────────────────────────────────
  about: {
    heading:  'More Than a Gym.',
    subheading: 'A Place Where Discipline Becomes Identity.',
    body:     'Knockout Gym has been Zirakpur\'s premier training facility since 2019. With world-class equipment, expert coaching, and a community that pushes you further — every session here counts.',
    image:    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  },

}

export default defaultContent
