import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  cacheGet,
  cacheSet,
  invalidateProductCache,
  productListCacheKey,
  productItemCacheKey,
} from "../utils/cache";

export async function createProduct(req: Request, res: Response) {
  try {
    const product = await prisma.product.create({
      data: req.body,
    });

    await invalidateProductCache();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    console.error("createProduct error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function listProducts(req: Request, res: Response) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const cacheKey = productListCacheKey({ search, category, page, limit });
    const cached = await cacheGet<{
      success: boolean;
      data: unknown;
      cached: boolean;
    }>(cacheKey);

    if (cached) {
      return res.status(200).json({ ...cached, cached: true });
    }

    const where: {
      isActive?: boolean;
      category?: string;
      OR?: Array<{ name?: { contains: string }; description?: { contains: string } }>;
    } = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    const response = {
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      cached: false,
    };

    await cacheSet(cacheKey, response);

    return res.status(200).json(response);
  } catch (error) {
    console.error("listProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cacheKey = productItemCacheKey(id);

    const cached = await cacheGet<{
      success: boolean;
      data: unknown;
      cached: boolean;
    }>(cacheKey);

    if (cached) {
      return res.status(200).json({ ...cached, cached: true });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const response = {
      success: true,
      data: { product },
      cached: false,
    };

    await cacheSet(cacheKey, response);

    return res.status(200).json(response);
  } catch (error) {
    console.error("getProduct error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    await invalidateProductCache();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    console.error("updateProduct error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await invalidateProductCache();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: { product },
    });
  } catch (error) {
    console.error("deleteProduct error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
