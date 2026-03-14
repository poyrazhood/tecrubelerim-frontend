export interface TrustBreakdown {
  reviewDepth: number
  recencyTrend: number
  verifiedRatio: number
  engagement: number
}

export interface TrustScore {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  score: number
  breakdown: TrustBreakdown
  trend: 'up' | 'down' | 'stable'
}

export interface TrustStack {
  sms: boolean
  transaction: boolean
  photo: boolean
}

export interface Business {
  id: string
  slug: string
  name: string
  category: string
  city: string
  district: string
  address: string
  phone: string
  website?: string
  trustScore: TrustScore
  trustStack: TrustStack
  hasGonulAlma?: boolean
  priceRange: string
  features: string[]
  hours: string
  isOpen: boolean
  image: string
  latitude?: number
  longitude?: number
  reviewCount: number
  semanticMatch?: number
  culturalTags: string[]
  badges: string[]
  subscriptionPlan?: 'FREE' | 'PROFESSIONAL' | 'PREMIUM' | 'ENTERPRISE'
  aiSummary: {
    atmosphere: string
    price: string
    bestTime: string
    highlights: string[]
  }
}

export interface Review {
  id: string
  businessId: string
  businessName: string
  businessSlug: string
  userName: string
  userHandle: string
  userImage?: string
  userIsMuhtar?: boolean
  userMuhtarNeighborhood?: string
  userIsExpert?: boolean
  userExpertise?: string
  content: string
  rating: number
  photos: string[]
  helpfulCount: number
  thankCount: number
  createdAt: string
  shieldStatus: 'safe' | 'warning' | 'danger'
  shieldReason?: string
  sentiment: {
    type: 'positive' | 'negative' | 'neutral' | 'irony' | 'unknown'
    score: number
    irony: boolean
  }
  ironyExplanation?: string
  aiHighlights?: string[]
}

export interface MuhtarUser {
  id: string
  name: string
  handle: string
  image?: string
  neighborhood: string
  expertise: string[]
  reviewCount: number
  helpfulCount: number
  followers: number
  rank: number
}

export type FeedItem =
  | { type: 'review'; data: Review }
  | { type: 'business_spotlight'; data: Business }
  | { type: 'muhtar_pick'; data: { muhtar: MuhtarUser; business: Business } }
