//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin-aratrik:bdroZShNksUVxBcG@cluster0.zhojb.mongodb.net/todolistDB");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemSchema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
})
const item2 = new Item({
  name: "What u wanna do today?"
})
const item3 = new Item({
  name: "Hit + to add a new item"
})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})
const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];
// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   } else {
//     console.log("Successfully saved default items to DB.");
//   }
// });

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          // console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      // const day = date.getDate();
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      foundItems.forEach(function(item){
        // console.log(item.name);
      });
    }
  });
  // const day = date.getDate();
  // res.render("list", {listTitle: day, newListItems: defaultItems});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  // item.save();
  // res.redirect("/");
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      // console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete",function(req,res){
  const item_id = req.body.checkbox;
  const listName = req.body.listName[0];
  console.log(listName);
  if(listName === "Today"){
    Item.findByIdAndRemove(item_id, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Successfully deleted checked item.");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: item_id}}}, function(err, foundList){
      if(err){
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    })
  }
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:topic", function(req,res){
  const requestedTopic = _.capitalize(req.params.topic);
  // res.render("list", {listTitle: requestedTopic, newListItems: defaultItems});
  const customlist = new List({
    name: requestedTopic,
    items: defaultItems
  })
  List.find({name: requestedTopic}, function(err, foundList){
    if(err){
      console.log(err);
    } else {
      if(foundList.length === 0){
        customlist.save();
        res.redirect("/" + requestedTopic);
      } else {
        // console.log(foundList);
        res.render("list", {listTitle: foundList[0].name, newListItems: foundList[0].items});
      }
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
