var yeoman = require("yeoman-generator");
var yosay = require("yosay");
var wrap = require("linewrap")(4, 60);
var gitConfig = require("git-config");
var open = require("open");
var validator = require("validator");
var npmconf = require("npmconf");

module.exports = yeoman.generators.Base.extend({
    initializing: {
        debug: function () {
            this.log.debug = this.log;
            this.log.warn = this.log;
            this.log.error = this.log;
            this.log.debug ("Initializing...");
        },
        gitConfig: function () {
            var done = this.async();

            // check local directory for a git repo, use those settings if available
            var pathToRepo = require("path").resolve("./.git");
            this.log.debug("Path to repo: ", pathToRepo);

            gitConfig(function (err, config) {
                if (err) {
                    if (err instanceof Error) throw err;
                    this.log.error("Git config error: " + err);
                }
                this.default_git_username = config.user.name;
                this.log.debug("Default Git Username: " + this.default_git_username);
                this.default_git_email = config.user.email;
                this.log.debug("Default Git Email: ", this.default_git_email);
                done();
            }.bind(this));
        }
    },
    prompting: function () {
    	this.log.debug ("Prompting...");
        this.log(yosay("Yo momma!"));

        var ask = function (info, question, browser, wait, url) {
            if (info.length > 0) this.log(wrap("\n" + info));
            if (browser === true) setTimeout(function () {
                open(url);
            }, wait * 1000);
            else if (browser !== undefined) this.log("Please open the URL: " + url);
            return question;
        }.bind(this);

        this.prompt([
            /**
             * Welcome user and ask if they want to continue
             */
            {
                type: "confirm",
                name: "continue",
                // message: "Hungry?",
                message: function () {
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
                },
                default: false
            },
            /**
             * Ask for the project name
             */
            {
                when: function (answers) {
                    if (answers.continue === false) {
                        this.log("\nBummer! Come back later when you are ready.");
                        process.exit(1);
                    }
                    return true;
                }.bind(this),
                type: "input",
                name: "project_name",
                message: function () {
                    return ask(
                        "Great! Let's get started." +
                        "\n\n" +
                        "First, let's start with some basic information:",
                        "Please enter the name for your project (e.g. - for the top of your README file): "
                    );
                },

            },
            /**
             * Ask for the element name
             */
            {
                type: "input",
                name: "element_name",
                message: function () {
                    return ask(
                        "",
                        "What are you going to name your new HTML element? (must contain a dash '-') "
                    );
                },
                validate: function (str) {
                    if (validator.contains(str, "-")) return true;
                    return "Your new HTML element must have a dash in the name, such as: 'test-element'";
                },
            },
            /**
             * Ask for git username
             */
            {
                type: "input",
                name: "git_username",
                default: this.default_git_username,
                message: function () {
                    return ask(
                        "",
                        "Your git name"
                    );
                }
            },
            /**
             * Ask for git email
             */
            {
                type: "input",
                name: "git_email",
                default: this.default_git_email,
                message: function () {
                    return ask(
                        "",
                        "Your git email"
                    );
                },
                validate: function (str) {
                    if (validator.isEmail(str)) return true;
                    return "Expected an email address, such as: 'joe@doe.com'";
                }
            },
            /**
             * Open browser for each step?
             */
            {
                type: "confirm",
                default: true,
                name: "browser",
                message: function () {
                    return ask(
                        "Some steps of this script may require you to open" +
                        "a web browser to create an account for a service" +
                        "or to get information about your existing accounts.",
                        "Would you like this script to automatically open a browser to the right URL for you?"
                    );
                }
            },
            /**
             * Create GitHub repo
             */
            {
                type: "input",
                name: "github_repo_url",
                message: function (answers) {
                    return ask(
                        "You will need a new repository that will serve as " +
                        "the home for your project. Please login to GitHub" +
                        "and create a new repository.",
                        "Enter the URL for your new repo: ",
                        answers.browser,
                        3,
                        "https://github.com/new"
                    );
                },
                validate: function (str) {
                    // check domain & format
                    if (validator.isURL(str) &&
                        str.match(/^https?:\/\/github\.com\/[^\/]+\/[^\/]+(.git)?$/)) return true;
                    return "Invalid GitHub repository URL. Expected something like: 'https://github.com/apowers313/generator-open-element'"
                }
            },
            /**
             * GitHub account
             */
            {
                type: "input",
                name: "github_account",
                message: function () {
                    return ask("", "GitHub account:");
                },
                default: function (answers) {
                    var slug = answers.github_repo_url.split("/").slice(3, 5).join("/").split(".")[0];
                    this.log(slug);
                    return slug.split("/")[0];
                }.bind(this)
            },
            /**
             * GitHub repo
             */
            {
                type: "input",
                name: "github_repo",
                message: function () {
                    return ask("", "GitHub repository name:");
                },
                default: function (answers) {
                    var slug = answers.github_repo_url.split("/").slice(3, 5).join("/").split(".")[0];
                    this.log(slug);
                    return slug.split("/")[1];
                }.bind(this)
            },
            /**
             * NPM API Token
             */
            {
                type: "list",
                name: "npm_token",
                message: "NPM API Token",
                choices: function (answers) {
                    var done = false;
                    var npm_api_tokens = [];
                    npmconf.load({}, function (err, conf) {
                        this.log.debug("NPM Username:", conf.get("username"));
                        this.log.debug("NPM API Token:", conf.get("//registry.npmjs.org/:_authToken"));
                        // npm_api_tokens.push(conf.get("//registry.npmjs.org/:_authToken"));
                        done = true;
                    }.bind(this));
                    require('deasync').loopWhile(function () {
                        return !done;
                    });

                    npm_api_tokens.push("Create New Token");
                    return npm_api_tokens;
                }.bind(this),
            },
            /**
             * Travis CI
             */
        ], function (answers) {
            this.log("Answers:", JSON.stringify(answers));
            this.answers = answers;
        }.bind(this));
    },
    configuring: function () {
    	this.log.debug ("Configuring...");
        // this.answers.github_slug = this.answers.github_account + "/" + this.answers.github_repo;
        // TODO: create NPM API key
        if (answers.npm_token === "Create New Token") {
        	this.log.debug ("Creating new NPM token");
        }
    },
    writing: function () {

    }
});