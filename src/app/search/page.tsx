import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";

interface SearchPageProps {
    searchParams: {
        query: string;
    }
}

export function generateMetadata({ searchParams: { query } }: SearchPageProps): Metadata {
    return {
        title: `Search: ${query} - ShopBuddy`,
        description: `Search results for "${query}"`,
    }
}

export default async function SearchPage(
    { searchParams: { query } }: SearchPageProps
) {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } }
            ]
        },
        orderBy: { id: 'desc' },
    })

    if(products.length === 0) {
        return (
            <div className="text-center">
                No Products found.
            </div>
        )
    }

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 my-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}