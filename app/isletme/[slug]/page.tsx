import { AppLayout } from '@/components/layout/AppLayout'
import { BusinessProfileClient } from '@/components/business/BusinessProfileClient'
import { MOCK_BUSINESSES, MOCK_REVIEWS } from '@/lib/mock-data'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return MOCK_BUSINESSES.map((b) => ({ slug: b.slug }))
}

export default function BusinessProfilePage({ params }: { params: { slug: string } }) {
  const business = MOCK_BUSINESSES.find((b) => b.slug === params.slug)
  if (!business) notFound()

  const reviews = MOCK_REVIEWS.filter((r) => r.businessId === business.id)

  return (
    <AppLayout hideBottomNav>
      <BusinessProfileClient business={business} reviews={reviews} />
    </AppLayout>
  )
}
