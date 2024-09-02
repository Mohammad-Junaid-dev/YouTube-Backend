import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Playlist } from "../models/playlist.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Not a valid channel id")
    }

    const subscribed = await Subscription.findOne(
        { subscriber: req.user?._id },
        { channel: channelId }
    )

    let flag;
    if (subscribed) {
        const removedSubscription = await Subscription.findByIdAndDelete(subscribed?._id);
        if (!removedSubscription) {
            throw new ApiError(501, "Something went wrong while unsubscibing")
        }

        flag = false;
    }
    else {
        const newSubscriber = await Subscription.create(
            {
                channel: new mongoose.Types.ObjectId(channelId),
                subscriber: req.user?._id
            }
        )
        if (!newSubscriber) {
            throw new ApiError(501, "Something went wrong while subscibing")
        }

        flag = true;

    }

    res.status(200).json(
        new ApiResponse(200, { isSubscribed: flag }, "Subscription toggled successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Not a valid channel id")
    }
    channelId = new mongoose.Types.ObjectId(channelId);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },
    ])
    if (!subscribers) {
        throw new ApiError(501, "No subscribers found")
    }

    res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Not a valid subscriber id")
    }

    const subscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
                pipeline: [{
                    $project: {
                        _id: 1,
                        "avatar.url": 1,
                        username: 1,
                    }
                }]
            }
        },
    ])

    if (!subscribedTo) {
        throw new ApiError(501, "No channels found")
    }

    res.status(200).json(
        new ApiResponse(200, subscribedTo, "Subscribed channel fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}