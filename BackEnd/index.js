//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://AmanYadav:QWERTY123@yaduvanshi0.hjj1ajf.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({          //Create a schema.
  name: { type: String }
});
const Item = mongoose.model("Item", itemSchema );

const item1 = new Item({
  name: "Welcome to your todolist v-2."
});
const item2 = new Item({
  name: "Hit the button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defultItems = [item1, item2, item3];

const listSchema = {
  name: { type: String },
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

//Item.insertMany(defaultItems);

app.get("/", function (req, res) {
  Item.find({}).then(function (foundItems) {
    // console.log(foundItems);
    if (foundItems.length === 0) {
      Item.insertMany(defultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });

    }
//OLD VERSION FORMAT DOWN
     /* Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });*/
    })});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then(function (foundList) {

    if (!foundList) {
      //Create new list.
      const list = new List({
        name: customListName,
        items: defultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      //Show an existing list.
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  })
  .catch(function (err) {
    console.log(err);

  });

});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
    
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function () {

      console.log("Successfully deleted checked item.");
      res.redirect("/"); 
   }); 
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(function () {
    
      res.redirect("/" + listName);
      
    });
   }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
