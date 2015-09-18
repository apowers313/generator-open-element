var yeoman = require("yeoman-generator");
var yosay = require("yosay");
var wrap = require("linewrap")(4, 60);



module.exports = yeoman.generators.Base.extend({
    initializing: function () {

    },
    prompting: function () {
        this.log(yosay("Yo momma!"));

        var ask = function (info, question) {
            if (info.length > 0) this.log(wrap("\n" + info));
            return question;
        }.bind(this);

        function ask_continue() {
        	return ask(
                "Welcome to the open-element-template configuration! " +
                "Over the next 5 minutes, this script will ask your for " +
                "all the information you need to create your new element. " +
                "\n\n" +
                "This script will self-destruct after you are done, so " +
                "you only get one shot at it. But it's okay, you can " +
                "always press 'control-c' or clone the repository again " +
                "to start over.",
                "Would you like to get started now?"
            );
        }

        function ask_project_name() {
            return ask(
                "Great! Let's get started." +
                "\n\n" +
                "First, let's start with some basic information:",
                "Please enter the name for your project (e.g. - for the top of your README file): "
            );
        }

        function ask_element_name() {
        	return ask(
        		"",
        		"What are you going to name your new HTML element? (must contain a dash '-') "
        	);
        }

        function has_dash (str) {
        	return (str.indexOf("-") !== -1);
        }

        this.prompt([{
            type: "confirm",
            name: "continue",
            // message: "Hungry?",
            message: ask_continue,
            default: false
        }, {
            type: "input",
            name: "project_name",
            message: ask_project_name,
        }, {
        	type: "input",
        	name: "element_name",
        	message: ask_element_name,
        	validate: has_dash,
        }
        ], function (answers) {
            this.log("Answers:", JSON.stringify(answers));
        }.bind(this));
    },
    writing: function () {

    }
});