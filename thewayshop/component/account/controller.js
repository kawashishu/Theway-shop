const bcrypt = require("bcrypt");
const service = require("./service");
const fs = require("fs");
const { profileValid, changepassValid } = require("../../helper/joiValidation");
const view = "../component/account/view/";

exports.myaccount = (req, res) => {
  res.render(view + "myaccountList", {
    title: "My Account",
  });
};

exports.cart = (req, res) => {
  res.render(view + "cartList", {
    title: "Cart",
  });
};

exports.checkout = async(req, res) => {
  if(!req.user){
    return res.redirect('/login');
  }
  else{
    const infor = await service.profile(req.user.id);
    res.render(view + "checkoutList", {
      title: "Check Out",
      infor:infor.rows[0]
    });
  }
  
};

// ////////////////////////////////////////////
exports.confirm = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const user_id = req.user.id;
  console.log(user_id);
  let order_product = await service.confirm_order(req.body, user_id);
  if (order_product) {
    return res.redirect("/myaccount/status");
  } 
};

// /////////////////////////////////////////

exports.status = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  res.render(view + "status", { title: "Status", page:page });
};
exports.wishlist = (req, res) => {
  res.render(view + "wishlistList", {
    title: "Wish List",
  });
};

exports.profile = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const user_id = req.user.id;
  const user_info = await service.profile(user_id);

  return res.render(view + "profile", {
    title: "My profile",
    user_info: user_info.rows[0],
  });
};

exports.yourorder = (req, res) => {
  res.render(view + "yourorder", {
    title: "Your order",
  });
};

exports.editProfile = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const { error } = profileValid(req.body);
  if (error) {
    return res.render(view + "profile", {
      title: "Profile",
      error: "Invalid infomation:" + error.details[0].message,
    });
  }
  const user_id = req.user.id;
  const { name, birthday, address, image } = req.body;
  try {
    console.log(name, birthday, address, image, user_id);
    const user_info = await service.editProfile(
      name,
      birthday,
      address,
      image,
      user_id
    );
    return res.render(view + "profile", {
      title: "My profile",
      user_info: user_info.rows[0],
    });
  } catch (e) {
    console.log(e);
    res.send("error");
  }
};

exports.changepass = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.render(view + "changepass");
};

exports.postchangepass = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const { error } = changepassValid(req.body);
  if (error) {
    return res.render(view + "changepass", {
      title: "Profile",
      error: "Invalid infomation:" + error.details[0].message,
    });
  }
  const { oldpassword, newpassword } = req.body;
  const user_id = req.user.id;
  const password = await service.getpass(user_id);
  const match = await bcrypt.compare(oldpassword, password.rows[0].password);
  if (!match) {
    return res.render(view + "changepass", {
      title: "Profile",
      error: "Invalid infomation: Old password isn't correct.",
    });
  }
  const hashedPassword = await bcrypt.hash(newpassword, 10);
  try {
    await service.changepass(hashedPassword, user_id);
    return res.render(view + "changepass", {
      title: "Profile",
      message: "Password change successfully.",
    });
  } catch (e) {
    res.send("error");
  }
};
