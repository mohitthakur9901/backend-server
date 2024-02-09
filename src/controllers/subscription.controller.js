
import {apiError} from '../utils/apiError.js'
import {ApiResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { Subscription } from '../models/subscription.model.js';

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const channel = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })
    if(channel){
        await channel.remove()
    }
    const subscribe = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    })
    await subscribe.save()
    return res.status(200).json(new ApiResponse(true, subscribe))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.find({channel: channelId})
    if (!subscribers) {
        throw new apiError('No subscribers found', 404)
    }
    return res.status(200).json(new ApiResponse(true, subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const channels = await Subscription.find({ subscriber: subscriberId })
    if (!channels) {
        throw new apiError('No channels found', 404)
    }
    return res.status(200).json(new ApiResponse(true, channels))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}