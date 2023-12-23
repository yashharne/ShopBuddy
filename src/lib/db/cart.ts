import { prisma } from "./prisma";
import { cookies } from "next/dist/client/components/headers"
import { Cart, Prisma } from "@prisma/client";

export type CartwithProducts = Prisma.CartGetPayload<{
    include: {
        items: {
            include: {
                product: true
            }
        }
    }
}>;

export type ShoppingCart = CartwithProducts & {
    size: number,
    subtotal: number,
}

export async function getCart(): Promise<ShoppingCart | null> {
    const localcartId = cookies().get("localcartId")?.value;
    const cart = localcartId 
        ? await prisma.cart.findUnique({
            where: { id: localcartId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
          })
        : null;
    
    if (!cart) {
        return null;
    }

    return {
        ...cart,
        size: cart.items.reduce((total, item) => total + item.quantity, 0),
        subtotal: cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0)
    }
}

export async function createCart(): Promise<ShoppingCart> {
  const newCart = await prisma.cart.create({
    data: {}
  });

  cookies().set("localcartId", newCart.id);

  return {
    ...newCart,
    items: [],
    size: 0,
    subtotal: 0
  }
}