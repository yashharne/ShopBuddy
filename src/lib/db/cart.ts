import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Cart, CartItem, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { cookies } from "next/dist/client/components/headers";
import { prisma } from "./prisma";

export type CartWithProducts = Prisma.CartGetPayload<{
   include: { items: { include: { product: true } } };
}>;
export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;
export type ShoppingCart = CartWithProducts & {
  size: number;
  subtotal: number;
};

// Retrieve user's cart
export async function getCart(): Promise<ShoppingCart | null> {
  const session = await getServerSession(authOptions);

  let cart: CartWithProducts | null = null;

  // If user is authenticated
  if (session) {
    cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    });
  } 
  // If user is not authenticated, use local cart
  else {
    const localCartId = cookies().get("localCartId")?.value;
    cart = localCartId
      ? await prisma.cart.findUnique({
          where: { id: localCartId },
          include: { items: { include: { product: true } } },
        })
      : null;
  }

  // If cart doesn't exist, return null
  if (!cart) {
    return null;
  }

  // Compute total items and subtotal and return
  return {
    ...cart,
    size: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    ),
  };
}

// Create a new cart for a user
export async function createCart(): Promise<ShoppingCart> {
  const session = await getServerSession(authOptions);

  let newCart: Cart;

  // If user is authenticated, associate cart with user
  if (session) {
    newCart = await prisma.cart.create({
      data: { userId: session.user.id },
    });
  } 
  // If user is not authenticated, create a generic cart
  else {
    newCart = await prisma.cart.create({
      data: {},
    });

    // Store local cart ID in cookies (insecure for production)
    cookies().set("localCartId", newCart.id);
  }

  // Return the newly created cart with default values
  return {
    ...newCart,
    items: [],
    size: 0,
    subtotal: 0,
  };
}

// Merge an anonymous cart into a user's cart
export async function mergeAnonymousCartIntoUserCart(userId: string) {
  const localCartId = cookies().get("localCartId")?.value;
  const localCart = localCartId
    ? await prisma.cart.findUnique({
        where: { id: localCartId },
        include: { items: true },
      })
    : null;

  // If no local cart, return
  if (!localCart) return;

  // Fetch user's cart
  const userCart = await prisma.cart.findFirst({
      where: {userId},
      include: {items: true}
  })

  // Transaction to merge items and update carts
  await prisma.$transaction(async tx => {
      if(userCart) {
          const mergedCartItems = mergeCartItems(localCart.items, userCart.items)

          // Delete existing items in user's cart
          await tx.cartItem.deleteMany({
              where: {cartId: userCart.id}
          })

          // Add merged items to user's cart
          await tx.cartItem.createMany({
              data: mergedCartItems.map(item => ({
                  cartId: userCart.id,
                  productId: item.productId,
                  quantity: item.quantity
              }))
          })
      }
      else {
          // If user doesn't have a cart, create one and add items
          await tx.cart.create({
              data: {
                  userId: userId,
                  items: {
                      createMany: {
                          data: localCart.items.map(item => ({
                              productId: item.productId,
                              quantity: item.quantity
                          }))
                      }
                  }
              }
          })
      }

      // Delete the local cart and clear its ID from cookies
      await tx.cart.delete({
          where: {id: localCart.id}
      })

    //   throw new Error("transaction failed")

      cookies().set("localCartId", "")
  })
}

// Utility function to merge cart items
function mergeCartItems(...cartItems: CartItem[][]) {
    return cartItems.reduce((acc, items) => {
        items.forEach(item => {
            const existingItem = acc.find(i => i.productId === item.productId);
            if(existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                acc.push(item);
            }
        });
        return acc;
    }, [] as CartItem[])
}
