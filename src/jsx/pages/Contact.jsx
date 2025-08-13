import React from "react";

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-white text-3xl font-bold mb-8">Contact Us</h1>
      <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <p className="text-gray-400">
                <strong className="text-white">Email:</strong>{" "}
                support@tournamentportal.com
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Phone:</strong> +1 (555)
                123-4567
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Address:</strong> 123
                Gaming St, Esports City, EC 12345
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">
              Send Message
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-white outline-none focus:border-red-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-white outline-none focus:border-red-500"
              />
              <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-white outline-none focus:border-red-500 resize-none"
              ></textarea>
              <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;