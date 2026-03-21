import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import chatsRouter from "./chats";
import ocrRouter from "./ocr";
import referralsRouter from "./referrals";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(chatsRouter);
router.use(ocrRouter);
router.use(referralsRouter);
router.use(webhooksRouter);

export default router;
