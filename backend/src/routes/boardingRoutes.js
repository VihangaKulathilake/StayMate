import express from "express";
import {
  createBoarding,
  deleteBoarding,
  getBoardingById,
  getBoardings,
  updateBoarding,
  getAdminStats,
  getPublicStats,
} from "../controllers/boardingController.js";
import { authorizeRoles, protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public/stats", getPublicStats);
router.get("/admin/stats", protect, authorizeRoles("admin"), getAdminStats);

router
  .route("/")
  .post(protect, authorizeRoles("admin", "landlord"), createBoarding)
  .get(optionalProtect, getBoardings);

router
  .route("/:id")
  .get(getBoardingById)
  .put(protect, authorizeRoles("admin", "landlord"), updateBoarding)
  .delete(protect, authorizeRoles("admin", "landlord"), deleteBoarding);

export default router;
