import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required" ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true
    },
<<<<<<< HEAD
    refreshToken: {
      type: String,
      
    },
=======
    // refreshToken: {
    //   type: String,
    //   required: true,
    // },
>>>>>>> 5340e1c4a3a924ea80c1ad97400942ec2e1f6784
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    coverImage: {
      type: String,
      
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken =  function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    // console.log(process.env.ACCESS_TOKEN_EXPIRY),
    
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};




userSchema.methods.generateRefreshToken = function () {
  return  jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
