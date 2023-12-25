import { Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link";
import PriceTag from "./PriceTag";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {

    const isNew = Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7;

    return (
        <Link href={`/products/${product.id}`} className="card card-normal w-96 bg-base-100 hover:shawdow-xl transition-shadow">
            <figure className="card-image">
                <Image src={product.imageUrl} alt={product.name} width={800} height={400} className="h-48 object-cover" />
            </figure>
            <div className="card-body">
                <h2 className="card-title flex justify-between">
                    {product.name}
                    {isNew && <div className="badge badge-outline badge-error ml-2">New</div>}
                </h2>
                <p className="card-subtitle">
                    {product.description}
                </p>
                <PriceTag price={product.price} className="mt-3" />
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">Buy Now</button>
                </div>
            </div>
        </Link >

    )

}