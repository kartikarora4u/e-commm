const mongoose = require("mongoose");
const Contact = new mongoose.Schema({
  email: {
    type: String,
  },
  username:{
    type:String,
  },
  message:{
    type:String,
  },
  phone:{
    type:String,
  }
});

// export UserSchema
module.exports = mongoose.model.Contact || mongoose.model("Contact", Contact);
