import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import "./App.css";
import {BrowserRouter as Router,Routes,Route,useNavigate,useLocation} from "react-router-dom";
import { Link } from "react-router-dom";

// ---------------- FAQ DATA ----------------
const faqs = [
  "Why are deepfakes considered a security threat?",
  "What signals do algorithms use to spot a deepfake?",
  "Can deepfake detection handle both images and videos?",
  "Are there open-source deepfake detection frameworks?",
  "How can organizations add deepfake detection to their workflows?",
  "What challenges limit the accuracy of detection systems?",
  "What role does human oversight play in validating detections?",
];

const answers = [
  "Deepfakes can spread misinformation, damage reputations, and enable fraud or identity-based scams.",
  "Algorithms look for unnatural blinking, lighting inconsistencies, audio mismatches, and compression patterns.",
  "Yes, many detectors are trained on multimodal datasets so they can evaluate still images, video streams, and audio.",
  "Yes, several open-source projects provide pretrained models and codebases for research and experimentation.",
  "Organizations often connect detection APIs into content moderation systems, SOC pipelines, or fraud-detection dashboards.",
  "Detection is hard because new generation models produce highly realistic outputs that reduce traditional artifact signals.",
  "Human analysts are often needed to confirm alerts and provide context that AI models alone might miss.",
];

// ---------------- CAROUSEL DATA ----------------
const data = [
  { img: "socialmediaDF.webp", title: "Social Media", percent: "38%", type: "Deepfake" },
  { img: "newsmediaDF.jpeg", title: "News Media", percent: "15%", type: "Deepfake" },
  { img: "paradeDF.webp", title: "Parade", percent: "29%", type: "Deepfake" },
  { img: "financialDocDF.webp", title: "Financial", percent: "45%", type: "Deepfake" },
  { img: "videocallsDF.png", title: "Video Calls", percent: "67%", type: "Deepfake" },
  { img: "scamcallsDF.png", title: "Scam Calls", percent: "22%", type: "Deepfake" }
];

function Carousel() {
  const [index, setIndex] = useState(0);
  const visibleCards = 3;

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? data.length - visibleCards : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev >= data.length - visibleCards ? 0 : prev + 1));
  };

  return (
    <section className="carousel">
      <button className="arrow" onClick={prevSlide} aria-label="Previous">‹</button>
      <div className="carousel-track">
        {data.slice(index, index + visibleCards).map((item, i) => (
          <motion.div
            key={i}
            className="card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.3 }}
          >
            <img src={item.img} alt={item.title} />
            <h3>{item.title}</h3>
            <p className="big">{item.percent}</p>
            <p>{item.type}</p>
          </motion.div>
        ))}
      </div>
      <button className="arrow" onClick={nextSlide} aria-label="Next">›</button>
    </section>
  );
}

// ---------------- IMAGE UPLOAD COMPONENT ----------------
function UploadSection() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/api/detect/image", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Server returned an error");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="upload" className="upload-container">
      <h2>Upload Image</h2>

      <input type="file" accept="image/*" onChange={handleChange} />

      {file && (
        <div className="preview">
          <h4>Preview:</h4>
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            style={{ maxWidth: "300px", borderRadius: "8px", marginTop: "10px" }}
          />
        </div>
      )}

      <button className="btn" onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload Now"}
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result:</h3>
          <p><strong>Prediction:</strong> {result.label}</p>
          <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>

          <div
            style={{
              width: "100%",
              backgroundColor: "#ddd",
              borderRadius: "8px",
              overflow: "hidden",
              height: "20px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: `${result.confidence * 100}%`,
                height: "100%",
                backgroundColor: result.label === "FAKE" ? "red" : "green",
              }}
            ></div>
          </div>

          {result.heatmap && (
            <div>
              <h4>Heatmap:</h4>
              <img
                src={`http://127.0.0.1:5000${result.heatmap}`}
                alt="Heatmap"
                style={{ width: "300px", marginTop: "10px" }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------- VIDEO SECTION ----------------
function VideoSection() {
  return (
    <motion.section
      className="video-section"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2>Deepfake vs Real Video</h2>
      <p className="muted">Watch side-by-side comparisons of real and AI-generated footage.</p>

      <div className="video-wrapper">
        <div className="video-box">
          <video autoPlay loop muted playsInline>
            <source src="real.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <p>(a) Real Video</p>
        </div>

        <div className="video-box">
          <video autoPlay loop muted playsInline>
            <source src="fake.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <p>(b) Fake Video</p>
        </div>
      </div>
    </motion.section>
  );
}

// ---------------- APPLICATIONS SECTION ----------------
function Applications() {
  const sections = [
    {
      id: "law",
      title: "Law Enforcement Analyzing Evidence",
      text: "Investigators use AI-powered deepfake detection to verify the authenticity of digital evidence in criminal cases. This ensures that manipulated images or videos don’t mislead investigations or court trials.",
      img: "lawEnforcementDF.webp",
      alt: "Law enforcement analyzing digital evidence",
      link: "https://en.wikipedia.org/wiki/Digital_forensics",
      btn: "Analyze Evidence →",
      reverse: false,
    },
    {
      id: "journalism",
      title: "Journalism & Media Verification",
      text: "Journalists rely on deepfake detection tools to verify videos and images before publication, ensuring misinformation doesn’t spread and the public receives authentic news.",
      img: "journalismAndMediaVerificationDF.jpeg",
      alt: "Journalist verifying news media content",
      link: "https://en.wikipedia.org/wiki/Media_literacy",
      btn: "Verify Media →",
      reverse: true,
    },
    {
      id: "education",
      title: "Education & Public Awareness",
      text: "Educators and institutions use deepfake detection to raise awareness among students and citizens, teaching them how to spot manipulated content and stay safe online.",
      img: "educationAndPublicAwarenessDF.jpeg",
      alt: "Educator teaching digital literacy",
      link: "https://en.wikipedia.org/wiki/Fact-checking",
      btn: "Learn More →",
      reverse: false,
    },
  ];

  return (
    <div className="applications">
      {sections.map(({ id, title, text, img, alt, link, btn, reverse }) => (
        <section
          key={id}
          id={id}
          className={`content-section ${reverse ? "reverse" : ""}`}
        >
          {/* TEXT BLOCK */}
          <motion.div
            className="law-text"
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2>{title}</h2>
            <p>{text}</p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              {btn}
            </a>
          </motion.div>

          {/* IMAGE BLOCK */}
          <motion.div
            className="law-img"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <img src={img} alt={alt} />
          </motion.div>
        </section>
      ))}
    </div>
  );
}


// ---------------- HOME PAGE ----------------
function HomePage() {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const toggleFAQ = (index) => {
    setActiveFAQ((prev) => (prev === index ? null : index));
  };
  const navigate = useNavigate();

  return (
    <div className="App">
      {/* NAV */}
      <nav className="navbar">
        <div className="logo">🔍 Deepfake Detection</div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#detection">Domains</a></li>
          <li><a href="#howto">How to Use</a></li>
          <li><a href="#applications">Applications</a></li>
          <li><Link to="/upload" style={{ cursor: "pointer" }}>Upload</Link></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </nav>

      <main>
        {/* HERO */}
        <section id="home" className="hero">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1>AI Deepfake Scanner for Images</h1>
            <p>Powered by cutting-edge AI, our tool exposes image tampering instantly.</p>
            <button className="btn" onClick={() => navigate("/upload")}>
              Try Deepfake Detection →
            </button>
          </motion.div>

          <motion.div
            className="hero-img"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <img src="fakeVSTrue.png" alt="Fake vs True" />
          </motion.div>
        </section>

        {/* DETECTION CAROUSEL */}
        <section id="detection" className="detection">
          <h2>Different Deepfake Detection Online</h2>
          <p className="muted">Whether it's for education, research, or peace of mind — people love using our tool.</p>
          <Carousel />
        </section>

        {/* HOW TO USE */}
        <section id="howto" className="howto">
          <h2>How to Use Deepfake Detection</h2>
          <div className="steps">
            {[
              ["Step 1: Upload Your File", "Click 'Upload' and choose an image file."],
              ["Step 2: Let AI Do the Work", "Our AI analyzes the file using deep-learning models."],
              ["Step 3: View the Results", "You get a clear authenticity score and breakdown."],
              ["Step 4: Download or Share", "Save or share the report for research or teaching."]
            ].map((s, i) => (
              <div key={i} className="step">
                <h4>{s[0]}</h4>
                <p>{s[1]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VIDEO SECTION */}
        <VideoSection />

        {/* APPLICATIONS */}
        <section id="applications">
          <Applications />
        </section>

        {/* FAQ */}
        <section id="faq" className="faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((q, i) => (
              <div
                key={i}
                className={"faq-item " + (activeFAQ === i ? "active" : "")}
                onClick={() => toggleFAQ(i)}
              >
                <div className="faq-question">
                  <span>{q}</span>
                  <FaChevronDown className={`arrow ${activeFAQ === i ? "open" : ""}`} />
                </div>
                {activeFAQ === i && <div className="faq-answer">{answers[i]}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="abovesection">
          <motion.div
            className="above-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h2>Free Online Deepfake Detection at Your Fingertips</h2>
            <p>Start using our deepfake detection tool online today — fast and accurate.</p>
            <button className="btn" onClick={() => navigate("/upload")}>
              Upload Now →
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// ---------------- APP ----------------
function App() {
  const location = useLocation();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadSection />} />
      </Routes>

      {/* Show footer only on home */}
      {location.pathname === "/" && (
        <footer className="site-footer">
          <div className="footer-main">
            <motion.div
              className="footer-col"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4>🔍 Deepfake Detection</h4>
              <p>Instantly uncover AI-manipulated images with precision and clarity.</p>
            </motion.div>

            <motion.div
              className="footer-col"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h4>Tools</h4>
              <p>Image Detection</p>
            </motion.div>

            <motion.div
              className="footer-col"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h4>About</h4>
              <p>About Us</p>
              <p>Privacy Policy</p>
            </motion.div>

            <motion.div
              className="footer-col"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h4>Contact</h4>
              <p>hello@deepfakedetection.com</p>
            </motion.div>
          </div>

          <div className="footer-copy">© 2025 Deepfake Detection. All rights reserved.</div>
        </footer>
      )}
    </div>
  );
}

// ---------------- ROOT ----------------
export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}