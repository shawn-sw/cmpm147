// project.js - purpose and description here
// Author: Your Name
// Date:

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
  }
}

function main() {
  const fillers = {
    adventurer: ["Trainer", "Rookie", "Champion", "Challenger"],
    message: ["message", "alert", "signal", "announcement"],
    pre: [
      "Cowell College",
      "Stevenson College",
      "Merrill College",
      "Kresge College",
      "Oakes College",
    ],
    post: ["lab", "rooftop", "basement", "classroom"],
    baddies: ["Team Rocket", "Team Galactic", "Team Plasma", "Team Flare"],
    monster: ["Gengar", "Ursaring", "Tyranitar", "Obstagoon"],
    pokemon: ["Arcanine", "Dragonite", "Metagross", "Lucario", "Flygon"],
    num: ["3", "5", "8", "a rare number of", "many"],
    loots: ["Poké Ball", "Potion", "Coin"],
  };
  const template = `$adventurer, please pay attention to this $message!
  
  $pre’s $post is in grave danger — it has been taken over by $baddies, who have sent $monster to wreak havoc. You must head out immediately and stop them — take your Pokémon $pokemon, with you!
  
  The one who saves them will be rewarded with $num $loots. That’s it — go forth!`;
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    //box.innerText = story;
    $("#box").html(story.replace(/\n/g, "<br>"));
  }
  
  /* global clicker */
  //clicker.onclick = generate;
  $("#clicker").click(generate);
  
  generate();
}

// let's get this party started - uncomment me
main();