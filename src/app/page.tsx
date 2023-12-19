import ProductCard from '@/components/ProductCard'
import { prisma } from '@/lib/db/prisma'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: {
      id: 'desc'
    }
  })

  return (
    <div>
      <div className='hero rounded-xl bg-base-200'>
        <div className="hero-content flex-col lg:flex-row gap-12">
          <Image
            src={products[0].imageUrl}
            alt={products[0].name}
            width={800}
            height={400}
            className="rounded-lg w-full max-w-sm shadow-2xl"
            priority
          />
          <div>
            <h1 className="text-5xl font-bold">
              {products[0].name}
            </h1>
            <p className="py-6">
              {products[0].description}
            </p>
            <Link href={`/products/${products[0].id}`} className="btn btn-primary">
              Check it out
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 my-4">
        {products.slice(1).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
