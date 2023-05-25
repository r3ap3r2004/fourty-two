import React, { useState, useEffect } from "react";
import { Sidebar, SidebarMobile } from "../../components/Sidebar";
import { useContactMutation } from "../../../data/api";

const Contact = () => {
  const [addContact, { error: error, data: data, isLoading: isUpdating }] =
    useContactMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [thankyou, setThankyou] = useState("");

  const handleSubmit = (event) => {
    // Perform validation
    event.preventDefault();
    const validationErrors = {};
    if (name?.trim() === "") {
      validationErrors.name = "Name is required";
    }
    if (email?.trim() === "") {
      validationErrors.email = "Email is required";
    }
    if (message?.trim() === "") {
      validationErrors.message = "Message is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const formData = new FormData();
      formData.append("contact[name]", name.trim());
      formData.append("contact[email]", email.trim());
      formData.append("contact[message]", message.trim());
      // need to submit to the backend
      console.log("TRYING TO SUBMIT", formData);
      addContact(formData);
    }
  };

  useEffect(() => {
    if (data) {
      setName("");
      setEmail("");
      setMessage("");
      setThankyou(
        "Thank you for your message. I will get back to you shortly."
      );
    }
  }, [data]);

  if (isUpdating)
    return (
      <div className="w-dyn-empty">
        <p>Sending...</p>
      </div>
    );

  if (error)
    return (
      <div className="w-dyn-empty">
        <p>{error}</p>
      </div>
    );

  return (
    <div>
      <Sidebar />
      <div className="content-column w-col w-col-9">
        <div className="post-wrapper" style={{ marginLeft: "10px" }}>
          <div className="post-content">
            {thankyou ? (
              <div
                style={{
                  border: "solid 1px black",
                  padding: "20px",
                  color: "red",
                  fontSize: "1.2em",
                }}
              >
                {thankyou}
              </div>
            ) : (
              ""
            )}
            <div className="body-copy w-richtext">
              <h1>Get in touch</h1>
              <p>Let's talk about how I can help you achieve your goals.</p>
            </div>

            <div className="form-wrapper w-form">
              <form onSubmit={handleSubmit}>
                <label htmlFor="Name">
                  Name *
                  {errors.name && <span className="error">{errors.name}</span>}
                </label>
                <input
                  type="text"
                  className="text-field w-input"
                  maxLength="256"
                  name="Name"
                  data-name="Name"
                  placeholder="Enter your name"
                  id="Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <label htmlFor="Email">
                  Email Address *
                  {errors.email && (
                    <span className="error">{errors.email}</span>
                  )}
                </label>
                <input
                  type="email"
                  className="text-field w-input"
                  maxLength="256"
                  name="Email"
                  data-name="Email"
                  placeholder="Enter your email address"
                  id="Email"
                  required=""
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <label htmlFor="Message">
                  Message *
                  {errors.message && (
                    <span className="error">{errors.message}</span>
                  )}
                </label>
                <textarea
                  id="Message"
                  name="Message"
                  placeholder="Enter your message"
                  maxLength="5000"
                  data-name="Message"
                  required=""
                  className="text-field text-area w-input"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                ></textarea>
                <input
                  type="submit"
                  value="Submit"
                  data-wait="Please wait..."
                  className="button w-button"
                />
              </form>
              <div className="success-message w-form-done">
                <p className="success-text">
                  Thank you! Your submission has been received!
                </p>
              </div>
              <div className="w-form-fail">
                <p>Oops! Something went wrong while submitting the form</p>
              </div>
            </div>
          </div>
        </div>
        <SidebarMobile />
      </div>
    </div>
  );
};

export default Contact;
