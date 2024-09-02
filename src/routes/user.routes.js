import { Router } from "express";
import { accessRefreshToken,
        changeCurrentPassword,
        getCurrentUser,
        getUserChannelProfile,
        getWatchHistoryDetails,
        loginUser, 
        logOutUser,
        registerUser, 
        updateAvatarProfile, 
        updateCoverImageProfile,
        updateUserAccountDetails

             }
              from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
<<<<<<< HEAD
        },
        
        
=======
        }
>>>>>>> 5340e1c4a3a924ea80c1ad97400942ec2e1f6784
        
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secure routes

router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(accessRefreshToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateUserAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatarProfile)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImageProfile)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistoryDetails)






export default router;