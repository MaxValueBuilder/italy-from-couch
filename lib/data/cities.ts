export interface City {
  id: string
  name: string
  image: string
  description: string
  history: string
  bestTime: string
  highlights: Array<{
    title: string
    description: string
  }>
  tips: string[]
}

export const cities: Record<string, City> = {
  rome: {
    id: "rome",
    name: "Rome",
    image: "/rome-colosseum.png",
    description: "The Eternal City - where ancient history breathes through every street corner.",
    history:
      "Founded in 753 BC, Rome was the center of the ancient Roman Empire and became one of the most powerful civilizations in human history. Today, it stands as a living museum where ancient ruins, Renaissance palaces, and modern life seamlessly coexist.",
    bestTime: "April-May and September-October offer ideal weather with fewer crowds than summer months.",
    highlights: [
      {
        title: "Colosseum",
        description: "The iconic amphitheater that once hosted gladiatorial contests and public spectacles.",
      },
      {
        title: "Roman Forum",
        description: "The ancient heart of Rome where emperors ruled and citizens gathered.",
      },
      {
        title: "Trevi Fountain",
        description: "The stunning Baroque masterpiece where visitors toss coins for luck.",
      },
      {
        title: "Pantheon",
        description: "One of the best-preserved Roman buildings with its magnificent dome.",
      },
      {
        title: "Vatican City",
        description: "The spiritual heart of Catholicism and home to incredible art and architecture.",
      },
      {
        title: "Trastevere",
        description: "The charming neighborhood where Romans truly live, eat, and socialize.",
      },
    ],
    tips: [
      "Start early to avoid crowds at major attractions.",
      "Wear comfortable shoes - you'll walk 20,000+ steps daily.",
      "Carry a water bottle and refill at public fountains.",
      "Learn a few Italian phrases; locals appreciate the effort.",
      "Eat where locals eat - skip the restaurants with picture menus.",
    ],
  },
  florence: {
    id: "florence",
    name: "Florence",
    image: "/florence-duomo-renaissance.jpg",
    description: "The Renaissance capital - where art, beauty, and history converge.",
    history:
      "Florence was the birthplace of the Renaissance, a cultural movement that transformed Europe. Home to the Medici family, this city produced some of humanity's greatest artists, architects, and thinkers. Today, it remains a living gallery of Renaissance masterpieces.",
    bestTime: "April-May and September-October provide pleasant weather and moderate crowds.",
    highlights: [
      {
        title: "Duomo",
        description:
          "The magnificent cathedral with Brunelleschi's iconic dome is Florence's most recognizable landmark.",
      },
      {
        title: "Uffizi Gallery",
        description: "One of the world's greatest art museums, home to works by Botticelli, Leonardo, and Raphael.",
      },
      {
        title: "Ponte Vecchio",
        description: "The famous bridge lined with jewelry shops that has connected Florence for centuries.",
      },
      {
        title: "Accademia Gallery",
        description: "Home to Michelangelo's David, perhaps the world's most famous sculpture.",
      },
      {
        title: "Palazzo Pitti",
        description: "A Renaissance palace with museums, gardens, and stunning views of the Arno.",
      },
      {
        title: "Oltrarno District",
        description: "The bohemian neighborhood south of the Arno where artisans and locals thrive.",
      },
    ],
    tips: [
      "Book museum tickets in advance to skip long queues.",
      "Climb the Duomo's dome early in the morning for fewer crowds.",
      "Cross the Ponte Vecchio at sunset for magical light.",
      "Explore neighborhoods beyond the main attractions.",
      "Try local specialties like bistecca alla fiorentina.",
    ],
  },
  venice: {
    id: "venice",
    name: "Venice",
    image: "/venice-canals-gondola.jpg",
    description: "The Floating City - a unique urban island where canals replace streets.",
    history:
      "Built on over 100 islands in a lagoon, Venice is one of history's most remarkable achievements in engineering and urban planning. Once a powerful maritime republic, Venice remains a magical city where time seems to have stopped, and water is the primary thoroughfare.",
    bestTime: "April-May and October-November offer pleasant weather with fewer tourists than summer.",
    highlights: [
      {
        title: "St. Mark's Square",
        description: "The heart of Venice with stunning Byzantine and Renaissance architecture.",
      },
      {
        title: "Rialto Bridge",
        description: "The iconic bridge spanning the Grand Canal, lined with shops and restaurants.",
      },
      {
        title: "Grand Canal",
        description: "The main waterway of Venice, lined with beautiful palaces and bridges.",
      },
      {
        title: "Basilica di San Marco",
        description: "An architectural masterpiece blending Byzantine, Romanesque, and Gothic styles.",
      },
      {
        title: "Burano Island",
        description: "A vibrant island famous for its brightly colored houses and lace-making tradition.",
      },
      {
        title: "Murano Island",
        description: "The famous glassmaking island where you can watch artisans create glass masterpieces.",
      },
    ],
    tips: [
      "Wear waterproof shoes - flooding can happen, especially in winter.",
      "Skip gondola rides in the main canals; they're touristy and expensive.",
      "Get lost in smaller streets away from St. Mark's Square.",
      "Visit early morning to experience Venice with fewer crowds.",
      "Try cicchetti (small Venetian appetizers) at local bars.",
    ],
  },
}
