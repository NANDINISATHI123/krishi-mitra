import { Testimonial, CalendarTask, Supplier, Tutorial, CommunityPost } from '../types.ts';

export const mockTestimonials: Testimonial[] = [
];

export const mockCalendarTasks: CalendarTask[] = [
  {
    id: 'task_oct_1',
    created_at: new Date().toISOString(),
    title: 'Prepare Fields for Rabi Crops',
    title_te: 'రబీ పంటల కోసం పొలాలను సిద్ధం చేయండి',
    description: 'Begin ploughing and harrowing fields. Incorporate well-decomposed farmyard manure or compost (2-3 tons/acre) to enrich the soil before sowing wheat, mustard, or gram.',
    description_te: 'పొలాలను దున్నడం మరియు చదును చేయడం ప్రారంభించండి. గోధుమ, ఆవాలు లేదా శనగ విత్తే ముందు నేలని సుసంపన్నం చేయడానికి బాగా కుళ్ళిన పశువుల ఎరువు లేదా కంపోస్ట్ (ఎకరాకు 2-3 టన్నులు) వేయండి.',
    month: 10,
    day_of_month: 5,
  },
  {
    id: 'task_oct_2',
    created_at: new Date().toISOString(),
    title: 'Kharif Crop Harvesting',
    title_te: 'ఖరీఫ్ పంట కోత',
    description: 'Harvest mature Kharif crops like paddy, maize, and soybean. Ensure proper drying of the produce before storage to prevent fungal growth and spoilage.',
    description_te: 'వరి, మొక్కజొన్న మరియు సోయాబీన్ వంటి పండిన ఖరీఫ్ పంటలను కోయండి. ఫంగల్ పెరుగుదల మరియు చెడిపోకుండా నిల్వ చేయడానికి ముందు ఉత్పత్తిని సరిగ్గా ఆరబెట్టండి.',
    month: 10,
    day_of_month: 15,
  },
  {
    id: 'task_oct_3',
    created_at: new Date().toISOString(),
    title: 'Seed Treatment for Rabi Crops',
    title_te: 'రబీ పంటలకు విత్తన శుద్ధి',
    description: 'Treat seeds with Beejamrutham or a Trichoderma solution before sowing. This organic practice protects seedlings from soil-borne diseases and improves germination rates.',
    description_te: 'విత్తే ముందు విత్తనాలను బీజామృతం లేదా ట్రైకోడెర్మా ద్రావణంతో శుద్ధి చేయండి. ఈ సేంద్రియ పద్ధతి మొక్కలను నేల నుండి వచ్చే వ్యాధుల నుండి రక్షిస్తుంది మరియు మొలకల శాతాన్ని మెరుగుపరుస్తుంది.',
    month: 10,
    day_of_month: 20,
  },
  {
    id: 'task_oct_4',
    created_at: new Date().toISOString(),
    title: 'Prepare Liquid Manures',
    title_te: 'ద్రవ ఎరువులను సిద్ధం చేయండి',
    description: 'Prepare batches of Jeevamrutham and Panchagavya. These will be crucial for providing nutrients to the newly sown Rabi crops during their initial growth stages.',
    description_te: 'జీవామృతం మరియు పంచగవ్య మిశ్రమాలను సిద్ధం చేయండి. కొత్తగా విత్తిన రబీ పంటలకు వాటి ప్రారంభ పెరుగుదల దశలలో పోషకాలను అందించడానికి ఇవి చాలా ముఖ్యమైనవి.',
    month: 10,
    day_of_month: 25,
  }
];

export const mockSuppliers: Supplier[] = [
];

export const mockTutorials: Tutorial[] = [
  {
    id: 'tut_1',
    created_at: new Date().toISOString(),
    title: 'Making Jeevamrutham Fertilizer',
    title_te: 'జీవామృతం ఎరువు తయారీ',
    category: 'Soil Health',
    videoUrl: 'https://storage.googleapis.com/krishi-mitra-videos/making-jeevamrutham.mp4',
    thumbnail: 'https://storage.googleapis.com/krishi-mitra-videos/making-jeevamrutham.jpg',
    description: 'A complete step-by-step guide to preparing Jeevamrutham, a powerful organic liquid fertilizer to boost soil microbes and fertility.',
    description_te: 'నేల సూక్ష్మజీవులను మరియు సంతానోత్పత్తిని పెంచడానికి శక్తివంతమైన సేంద్రియ ద్రవ ఎరువు అయిన జీవామృతం తయారీకి పూర్తి దశలవారీ మార్గదర్శి.',
  },
  {
    id: 'tut_2',
    created_at: new Date().toISOString(),
    title: 'Natural Pest Control with Neem Oil',
    title_te: 'వేప నూనెతో సహజ పురుగుల నియంత్రణ',
    category: 'Pest Control',
    videoUrl: 'https://storage.googleapis.com/krishi-mitra-videos/neem-oil-pesticide.mp4',
    thumbnail: 'https://storage.googleapis.com/krishi-mitra-videos/neem-oil-pesticide.jpg',
    description: 'Learn how to properly mix and apply neem oil solution, a safe and effective way to manage common pests like aphids and whiteflies.',
    description_te: 'అఫిడ్స్ మరియు వైట్‌ఫ్లైస్ వంటి సాధారణ తెగుళ్లను నిర్వహించడానికి సురక్షితమైన మరియు ప్రభావవంతమైన మార్గం అయిన వేప నూనె ద్రావణాన్ని సరిగ్గా కలపడం మరియు పిచికారీ చేయడం ఎలాగో తెలుసుకోండి.',
  },
  {
    id: 'tut_3',
    created_at: new Date().toISOString(),
    title: 'Low-Cost Drip Irrigation Setup',
    title_te: 'తక్కువ ఖర్చుతో డ్రిప్ ఇరిగేషన్ ఏర్పాటు',
    category: 'Water Management',
    videoUrl: 'https://storage.googleapis.com/krishi-mitra-videos/drip-irrigation.mp4',
    thumbnail: 'https://storage.googleapis.com/krishi-mitra-videos/drip-irrigation.jpg',
    description: 'Conserve water and improve plant health by building a simple and affordable drip irrigation system from locally sourced materials.',
    description_te: 'స్థానికంగా లభించే పదార్థాలతో సరళమైన మరియు చవకైన డ్రిప్ ఇరిగేషన్ వ్యవస్థను నిర్మించడం ద్వారా నీటిని ఆదా చేయండి మరియు మొక్కల ఆరోగ్యాన్ని మెరుగుపరచండి.',
  },
  {
    id: 'tut_4',
    created_at: new Date().toISOString(),
    title: 'Effective Vermicomposting at Home',
    title_te: 'ఇంట్లో ప్రభావవంతమైన వర్మికంపోస్టింగ్',
    category: 'Soil Health',
    videoUrl: 'https://storage.googleapis.com/krishi-mitra-videos/vermicomposting.mp4',
    thumbnail: 'https://storage.googleapis.com/krishi-mitra-videos/vermicomposting.jpg',
    description: 'Turn your kitchen waste into black gold. This tutorial covers setting up a vermicompost bin and managing it for high-quality manure.',
    description_te: 'మీ వంటగది వ్యర్థాలను నల్ల బంగారంగా మార్చండి. ఈ ట్యుటోరియల్ వర్మికంపోస్ట్ బిన్‌ను ఏర్పాటు చేయడం మరియు అధిక-నాణ్యత ఎరువు కోసం దానిని నిర్వహించడంపై వివరిస్తుంది.',
  },
  {
    id: 'tut_5',
    created_at: new Date().toISOString(),
    title: 'Panchagavya: Preparation and Uses',
    title_te: 'పంచగవ్య: తయారీ మరియు ఉపయోగాలు',
    category: 'Crop Management',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    description: 'An ancient organic formulation, Panchagavya acts as a potent plant growth promoter. Learn the correct recipe and application methods.',
    description_te: 'ఒక పురాతన సేంద్రియ సూత్రీకరణ, పంచగవ్య మొక్కల పెరుగుదలను ప్రోత్సహించే శక్తివంతమైనదిగా పనిచేస్తుంది. సరైన రెసిపీ మరియు అప్లికేషన్ పద్ధతులను తెలుసుకోండి.',
  },
  {
    id: 'tut_6',
    created_at: new Date().toISOString(),
    title: 'Introduction to Multi-Cropping',
    title_te: 'బహుళ-పంటల పరిచయం',
    category: 'Crop Management',
    videoUrl: 'https://www.youtube.com/watch?v=9y73P4JqALI',
    thumbnail: '',
    description: 'Understand the principles of multi-cropping to improve soil health, reduce pest attacks, and increase your overall farm income.',
    description_te: 'నేల ఆరోగ్యాన్ని మెరుగుపరచడానికి, తెగుళ్ల దాడులను తగ్గించడానికి మరియు మీ మొత్తం వ్యవసాయ ఆదాయాన్ని పెంచడానికి బహుళ-పంటల సూత్రాలను అర్థం చేసుకోండి.',
  }
];

export const mockCommunityPosts: CommunityPost[] = [
];