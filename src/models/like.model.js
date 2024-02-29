import mongoose, {Schema} from "mongoose";


const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

likeSchema.methods.unliked = async function () {
    // Find the user by ID and remove the reference
    await this.model('User').findByIdAndUpdate(this.likedBy, {
        $pull: { likes: this._id }
    });

    // Remove the user ID from the Like instance
    this.likedBy = undefined;

    // Save the changes
    await this.save();
};

export const Like = mongoose.model("Like", likeSchema)
