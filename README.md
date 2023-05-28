# 42

### The answer to the ultimate question of life, the universe, and everything.

---

![Home Page](app/assets/images/homepage.png?raw=true "Home Page")

---

## About

This project is the result of a coding challenge that I was given. The challenge was to create a web application in Rails and React
that would allow a user to parse a PDF book to generate a set of openai embeddings that are stored in a local file. The frontend interface
allows the user to ask questions about the book and the backend will use the embeddings to find the most relevant section of the book to
supply as an answer to the question.

The basic requirements of the challenge were:

1. The user should be able to use a script to parse a PDF book and generate a set of embeddings that are stored in a local file.
1. The user should be able to ask a question about the book and get an answer in an interface written in React.
1. The answer should also have an audio file so that the user can listen to the answer.

I also decided to add a few additional features to the project to make it more user friendly and to allow for more than a single book to be used.

The additional features that I added were:

1. The user can upload a PDF book to the server and the server will parse the book and generate the embeddings. No need to run a script locally.
1. Multiple books can be uploaded and the user can select which book to use when asking a question.
1. The user can ask a question and the server will return the most relevant section of the book as an answer.
1. Users can be created to limit access to the application. This is necessary to prevent the openai and resemble.ai keys from being used by
   unauthorized users and running up a large bill.
1. A contact form to allow users to contact me. Most of the code that I write stays behind paywalls and corporate firewalls so I
   don't often get the chance to share my work with others. I decided to make this project into an app that any potential client can use
   to evaluate my abilities in the future. Of course because of the expense involved in openai and resemble.ai related fees it will always be
   invite only to see the running app.
1. An about page to describe the project and to give a little information about myself.
1. Docker configuration files needed to be able to easily spin up the project on any machine that has docker installed.
1. A sidekiq worker to handle the book embeddings asynchronousely.
1. Redis to handle websocket subscriptions. This allows the server to push data to the client when the audio has finished
   processing. This is necessary because the resemble.ai api is asynchronous and the server needs to wait for the audio to be generated before
   it can send the response to the client. It is also needed for sidekiq.

---

## Challenges that needed to be overcome

1. resemble.ai no longer allows synchronous requests. This means that the server needs to be able to handle asynchronous responses from the resemble.ai api. This is a challenge because the user just asked a question, and they are expecting a result now, not the next time they ask the same question again in the future.

1. The openai api is rate limited to 60 requests per minute and 150,000 tokens per minute for new user accounts. This means that it is impossible to import a full book before hitting the rate limit, necessitating the ability to not only deal with the rate limit, but also be able to adjust it for users with higher rate limits.

## Challenges without good solutions

1. Resemble.ai has a pretty strict content policy. During testing I uploaded a portion of the book "Adventures of Huckleberry Finn, by Mark Twain. It is a classic book that includes a character named Jim who is a slave. The book was set during a period where slavery was legal in America and discusses some of those issues. When I asked the question: "Who was the slave?", openAI correctly responded that: "The slave was Jim", however resemble.ai refused to convert that phrase into audio, claiming that it violates their content policy. There isn't much I can do about that, so I would be interested in finding a better solution for converting the audio, but using resemble.ai was part of the challenge, so there are some responses that may not get audio conversion.

---

## Assumptions made

1. I made the assumption that the simplest solution to a Rails backend / React frontend, is to have Rails render the React app. It would have been trivial to have placed the React app in a separate repository, and created a separate deployment for it, but I didn't feel it necessary for this particular project. Most React apps that I have seen, and tutorials that are written usually have the React app behave like an independent application. I felt it was more appropriate to show that other solutions are possible. Which solution is best is open for discussion and will vary depending on business requirmenets, team size, and other factors.
1. User management was not part of the challenge, so I didn't bother re-building all of the login pages in React. Given the fact that I am using the login to limit access to the whole app rather than control features inside the app I figured it was unnecessary to complicate the frontend with pages that could easily be handled by Rails and Devise. This also highlights the fact that the app doesn't need to be all Rails or all React. It is possible to use both together.

## Things that I would do differently

1. In all honesty, I probably would have stuck to the described challenge. I ended up burning more time than I would have liked to on code that nobody is paying me to write, and may or may not be appreciated. In a real business environment I would ensure that any additional features had a valid business case and were not just "nice to have" features. In this case I thought it best to show my ability to deal with additional parts of what would exist in a production website.

---

## Installation

There are multiple ways that you can run the code in this project. You can do a normal Rails project install
where you install the version of ruby specified in .ruby-version and then run `bundle install` and `rails s` to
start the server. You can also use docker to run the project. The docker installation is the preferred method
and is the only one that is documented here.

### Docker Installation

1. Copy `env.sample` to `.env`
1. Edit `.env` and change the values to match your environment.
   - in particular, you need to add your openAI and resemble.ai keys
   - You should set the others as well, but without the previous keys the app won't work.
1. Make sure that you have docker installed.
1. Run `docker compose up` to start the server.

That really is all that is required to get the server running. You can then access the server at http://localhost:3000

Once you have run the `docker compose up` command you will find that there are 4 different processes running:

1. The rails server
1. The sidekiq worker
1. The postgres database
1. The redis server

The logs from each of the processes are written to stdout and can be viewed in the terminal used to start the processes.
If you don't wish to see the logs in the terminal you can run `docker compose up -d` to start the processes in the background.

You can access the logs for each of these processes running in the background by running `docker compose logs -f <process name>`.
For example, to view the logs for the rails server you would run `docker compose logs -f web`.

---

## Usage

### Command line embeddings generation

You can generate the embeddings for a book by running the following command:

```bash
docker compose run web bundle exec rake book_parser:parse_book[./spec/fixtures/adventures_of_huckleberry_finn.pdf,./adventures_of_huckleberry_finn.csv]
```

Note: The file will need to exist inside the docker container. When running in dev mode is folder and all subfolders are mounted into the docker container so you can place the file in any subfolder and it will be accessible to the docker container.

If you are running the app locally outside of docker then the command can be simplified to be:

```bash
bundle exec rake book_parser:parse_book[./spec/fixtures/adventures_of_huckleberry_finn.pdf,./adventures_of_huckleberry_finn.csv]
```
