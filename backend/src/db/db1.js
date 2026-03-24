import mongoose from "mongoose";
import {db_name} from '../constants.js';
const connectDB=async()=>{
try {
    const connectionInstance=await mongoose.connect( `${process.env.MongoDB_URI}/${db_name}`)
     console.log(`\n MongoDB connect  !! db host:${connectionInstance.connection.host}`);
} catch (error) {
      console.log("Mongodb error",error);
        process.exit(1)
}
}
export default connectDB;