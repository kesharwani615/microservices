import { Router } from "express";
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
} from "../utils/validation";

const router = Router();

router.post("/", validate(createProductSchema), createProduct);
router.get("/", listProducts);
router.get("/:id", getProduct);
router.put("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
