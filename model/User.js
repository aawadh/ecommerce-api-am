import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fullname:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    orders:[

        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    wishlist:[

        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wishlist",
        },
    ],
    isAdmin:{
        type: Boolean,
        default: false,
    },
    hasShippingAddress: {
        type: Boolean,
        default: false,
    },
    shippingAddress: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        Governate: {
            type: String,
        },
        Area: {
            type: String,
        },
        Block: {
            type: String,
        },
        Street: {
            type: String,
        },
        BuildingNumber: {
            type: String,
        },
        Phone: {
            type: String,
        },

    },
},{
    timestamps: true,
});

const User = mongoose.model("User",UserSchema);

export default User;