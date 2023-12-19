import { formatPrice } from "@/lib/format"
import { format } from "path"

interface PriceTagProps {
    price: number,
    className?: string
}

export default function PriceTag({ price, className }: PriceTagProps) {
    return (
        <span className={`badge badge-outline ${className}`}>
            {formatPrice(price)}
        </span>
    )
}