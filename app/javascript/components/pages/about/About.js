import React from "react";
import { Sidebar, SidebarMobile } from "../../components/Sidebar";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div>
      <Sidebar />
      <div className="content-column w-col w-col-9">
        <div className="post-wrapper" style={{ marginLeft: "10px" }}>
          <div className="post-content">
            <div className="body-copy w-richtext">
              <h1>About "Ask A Book"</h1>
              <p>
                Ask A Book is a place where you can ask questions about various
                books. This was part of a coding challenge that I extended to be
                more than just the bare minimum of the challenge.
              </p>
              <p>
                I have had numerous communications with prospective employers
                who wanted to see examples of the work that I can do in React
                and Ruby on Rails. Unfortunately most of the work that I have
                done sits behind paywalls and corporate networks, which makes it
                hard to share with outside people. I decided that if I'm going
                to spend time on a challenge for one company I may as well
                showcase my abilities for other companies as well.
              </p>
              <h2>So how does it work?</h2>
              <p>
                Ask A Book is able to ingest books in PDF format. It then uses
                openAI to generate embeddings of each page of the book. When a
                user asks a question, the question is then sent to openAI to
                generate an embedding for the question. The results are then
                compared against the embeddings for each page of the book. The
                page with the highest similarity is then used to provide context
                for an additional openAI call to generate an answer based on the
                question and the page data.
              </p>
              <p>
                Once a question has been answered by openAI, the question is
                then sent to resemble.ai to generate an audio clip of the
                answer, which is played back to the user.
              </p>
              <p>
                This all seems like it is fairly simple, and the truth is that
                it is. There are a couple of things that make this a little more
                complicated than it seems at first glance.
              </p>
              <ol>
                <li>
                  The most challenging aspect is that resemble.ai does not allow
                  synchronous audio conversion unless you are on the enterprise
                  plan. This wasn't true at one point in time, but was when I
                  was creating this project. This means that I need to be able
                  to push the audio data to the client from the server when it
                  is generated. This is done using ActionCable, which allows me
                  to broadcast changes to the models to the client in real time.
                </li>
                <li>
                  Another item that tripped me up was that openAI has a limit of
                  the number of requests that can be made per minute, and also a
                  limit on the number of tokens that can be processed per
                  minute. As it turns out this limit is dynamic and changes over
                  time. When you first sign up for openAI the limit is actually
                  too low to be able to ingest the whole book before hitting the
                  rate limit. This means that you need to track more than just
                  the number of requests to the api per minute, but also the
                  number of tokens that have been used as well. The current code
                  assumes that only one person will ever be uploading books at a
                  single time and can handle the rate limiting for this case. If
                  I wanted to scale this service and make it a SAAS product that
                  code would need to be modified to track usage across all
                  users. Additionally the limits are set via environment
                  variables at deploy time. As those limits increase the site
                  will not automatically take those into consideration. I
                  believe this is an appropriate tradeoff given the purpose of
                  this project.
                </li>
              </ol>
              <h2>So why is the repo called fourty-two?</h2>
              <p>
                Because 42 is the answer to the ultimate question of life, the
                universe, and everything.
                <br />
                <a
                  rel="nofollow"
                  href="https://en.wikipedia.org/wiki/Phrases_from_The_Hitchhiker%27s_Guide_to_the_Galaxy#Answer_to_the_Ultimate_Question_of_Life,_the_Universe,_and_Everything_(42)"
                >
                  The number 42.
                </a>
                <br />
                <a
                  rel="nofollow"
                  href="https://en.wikipedia.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy_(novel)"
                >
                  The Hitchhiker's Guide to the Galaxy
                </a>
                <br />
                Unfortunately I do not have a PDF copy of this book, or the
                rights to put it on the internet even if I did.
              </p>
              <h2>Where did the books come from?</h2>
              <p>
                The books that are currently available on the site are from:
                <br />
                <a href="https://www.freeclassicebooks.com/">
                  https://www.freeclassicebooks.com/
                </a>
              </p>
              <h2>Why can't I upload my own book?</h2>
              <p>
                I don't give everyone access to upload books because processing
                the books costs me money, but his site doesn't generate any
                revenue to offset those costs.
              </p>
              <p>
                If we are in active communication about a job opportunity then I
                will have given you login information to be able to upload
                books. If I haven't then <Link to={"/contact"}>contact me</Link>
                .
              </p>
              <h2>Is this all you can do?</h2>
              <p>
                Don't be silly. This is just a small sample of what I can do. I
                could have built the frontend using Rails Hotwire and Stimulus
                instead, but that wasn't the requirment for the coding
                challenge, so I didn't do it, and frankly Hotwire and Stimulus
                are easier than React, so the current implementation is actually
                more work than the alternative.
              </p>
              <p>
                I could have also built the backend in Golang, but again, that
                wsn't the requirement for the coding challenge, so I didn't do
                it.
              </p>
            </div>
            <p>Do you want to talk about how I can help your company?</p>
            <Link to={"/contact"} className="button w-button">
              Get in touch
            </Link>
          </div>
        </div>
        <SidebarMobile />
      </div>
    </div>
  );
};

export default About;
