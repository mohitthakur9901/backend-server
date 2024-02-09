import { Router } from "express";
import {deleteVideo,getAllVideos,getVideoById,publishAVideo,togglePublishStatus,updateVideo} from '../controllers/video.controller.js'
import {verfiyJWT} from '../middlewares/auth.js'
import {upload} from '../middlewares/multer.js'

const router = Router();
router.use(verfiyJWT)
router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;