export interface TrustScore {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  score: number
  breakdown: { reviewDepth: number; recencyTrend: number; verifiedRatio: number; engagement: number }
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
  reviewCount: number
  semanticMatch?: number
  culturalTags: string[]
  badges?: string[]
  rating?: number
  isVerified?: boolean
  subscriptionPlan?: string
  attributes?: string[]
  aiSummary?: { atmosphere: string; price: string; bestTime: string; highlights: string[] }
  description?: string
  merchantResponse?: string
  latitude?: number
  longitude?: number
}

export interface Review {
  id?: string
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
  sentiment: {
    type: 'positive' | 'negative' | 'neutral' | 'irony' | 'unknown'
    score?: number
    irony: boolean
  }
  photos?: string[]
  helpfulCount: number
  thankCount: number
  createdAt: string
  shieldStatus: 'safe' | 'warning' | 'danger'
  shieldReason?: string
  aiHighlights?: string[]
  ironyExplanation?: string
}

export interface MuhtarUser {
  id?: string
  name?: string
  handle?: string
  image?: string
  neighborhood?: string
  expertise?: string[]
  rank?: number
  reviewCount?: number
  helpfulCount?: number
  followers?: number
  isMuhtar?: boolean
  muhtarNeighborhood?: string
}

export interface User {
  id: string
  name: string
  handle: string
  email?: string
  phone?: string
  avatar?: string
  bio?: string
  city?: string
  isMuhtar?: boolean
  muhtarNeighborhood?: string
  trustScore?: number
  badgeLevel?: string
  trustLevel?: string
  totalReviews?: number
  helpfulVotes?: number
  followersCount?: number
  followingCount?: number
  createdAt?: string
  reviewCount?: number
  isVerified?: boolean
}

export type FeedItem =
  | { type: 'review'; data: Review }
  | { type: 'business_spotlight'; data: Business }
  | { type: 'muhtar_pick'; data: { muhtar: MuhtarUser; business: Business } }
