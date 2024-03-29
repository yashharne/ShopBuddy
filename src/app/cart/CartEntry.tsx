"use client";

import { CartItemWithProduct } from "@/lib/db/cart";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useTransition } from "react";
import { setProductQuantity } from "./actions";

interface CartEntryProps {
    cartItem: CartItemWithProduct;
    setProductQuantity: (productId: string, quantity: number) => Promise<void>;
}

export default function CartEntry(
    { cartItem: { product, quantity } }: CartEntryProps
) {

    const [isPending, startTransition] = useTransition();

    const quantityOptions: JSX.Element[] = [];
    for (let i = 1; i <= 99; i++) {
        quantityOptions.push(
            <option key={i} value={i}>
                {i}
            </option>
        )
    }

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3">
                <Link href={`/products/${product.id}`}>
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="rounded-lg"
                    />
                </Link>
                <div className="flex justify-between flex-grow">
                    <div className="flex flex-col justify-evenly">
                        <Link href={`/products/${product.id}`} className="font-bold text-2xl">
                            {product.name}
                        </Link>
                        <div>
                            Price: {formatPrice(product.price)}
                        </div>
                    </div>
                    <div className="flex flex-col justify-evenly">
                        <div className="my-1 flex items-center gap-2">
                            Quantity:
                            <select
                                className="select select-bordered w-full max-w-[80px]"
                                defaultValue={quantity}
                                onChange={e => {
                                    const newQuantity = parseInt(e.currentTarget.value);
                                    startTransition(async () => {
                                        await setProductQuantity(product.id, newQuantity);
                                    })
                                }}
                            >
                                <option value={0}>0</option>
                                {quantityOptions}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            Total: {formatPrice(product.price * quantity)}
                            {
                                isPending && <span className="loading loading-spinner loading-sm" />
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="divider" />
        </div>
    )
}   