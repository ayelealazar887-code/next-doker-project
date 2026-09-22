// src/controllers/order.controller.ts

import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

const allowedStatuses = [
  "PENDING",
  "PAID",
  "CANCELLED",
  "COMPLETED",
] as const;

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, items } = req.body;

    // Validate userId and items
    const parsedUserId = Number(userId);

    if (
      !Number.isInteger(parsedUserId) ||
      parsedUserId <= 0 ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Valid userId and items are required",
      });
    }

    // Check user
    const user = await prisma.user.findUnique({
      where: {
        id: parsedUserId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prepare order items
    const orderItems: {
      productId: number;
      quantity: number;
      price: typeof items[number]["price"];
    }[] = [];

    let total = 0;

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      // Validate productId
      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      // Validate quantity
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than 0",
        });
      }

      // Find product
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(404).json({
          message: `Product ${productId} not found`,
        });
      }

      // Check stock
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      const itemTotal = Number(product.price) * quantity;

      total += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    // Create order + order items + update stock
    const order = await prisma.$transaction(async (tx) => {
      // Update stock first using a conditional update.
      for (const item of orderItems) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // If count is 0, another transaction probably consumed the stock.
        if (updatedProduct.count === 0) {
          throw new Error(
            `Not enough stock for product ${item.productId}`
          );
        }
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: parsedUserId,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return newOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return res.json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: {
          orderId: id,
        },
      });

      await tx.order.delete({
        where: {
          id,
        },
      });
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};