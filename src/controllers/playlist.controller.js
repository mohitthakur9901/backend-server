import {apiError} from '../utils/apiError.js'
import {ApiResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { Playlist } from '../models/playlist.model.js';


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const {videoId} = req.params
    const existingPlaylist = await Playlist.find({name})
    if(existingPlaylist){
        throw new apiError('Playlist already exists', 400)
    }
    const playlist = await Playlist.create({
        name,
        description,
        videos: videoId,
        owner: req.user._id
    })
    await playlist.save()
    return res.status(200).json(new ApiResponse(true, playlist))


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({owner: userId})
    if(!playlists){
        throw new apiError('No playlists found', 404)
    }
    return res.status(200).json(new ApiResponse(true, playlists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById({_id :playlistId})
    if(!playlist){
        throw new apiError('No playlist found', 404)
    }
    return res.status(200).json(new ApiResponse(true, playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist = await Playlist.findById({_id: playlistId})
    if(!playlist){
        throw new apiError('No playlist found', 404)
    }
    playlist.videos.push(videoId)
    await playlist.save()
    return res.status(200).json(new ApiResponse(true, playlist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findById({_id: playlistId})
    if(!playlist){
        throw new apiError('No playlist found', 404)
    }
    playlist.videos.pull(videoId)
    await playlist.save()
    return res.status(200).json(new ApiResponse(true, playlist))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlist = await Playlist.findById({_id: playlistId})
    if(!playlist){
        throw new apiError('No playlist found', 404)
    }
    await playlist.remove()
    return res.status(200).json(new ApiResponse(true, playlist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById({_id: playlistId})
    if(!playlist){
        throw new apiError('No playlist found', 404)
    }
    playlist.name = name
    playlist.description = description
    await playlist.save()
    return res.status(200).json(new ApiResponse(true, playlist))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}