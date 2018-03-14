import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const addressSchema = new Schema({
    name: String,
    id: Number,
    phone: String,
    user_id: Number,
    created_at: {type: Date, default: Date.now()},
    address: String,
    address_detail: String,
    gender: String,
    province: String,
    city: String,
    district: String,
    lng: String,
    lat: String,
    house_number:String     //门牌号
})
/*    "gd_addr_type": "",
    "is_default": 0,
    "address_range_tip": "",
    "editable": 1,
    "bind_type": 11,
    "can_shipping": 1,
    "address_type": 0*/
addressSchema.index({id: 1});

const Address = mongoose.model('Address', addressSchema);

export default Address