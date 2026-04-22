import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Brand Story */}
        <section className="section about-header">
          <h1 className="section-title text-center">Our <span className="text-gradient">Story</span></h1>
          <div className="about-content glass-panel">
            <p>
              Founded in 2024, <strong>Frozen Delights</strong> began with a simple mission: to create the most exquisite, premium frozen desserts using only the finest organic ingredients.
            </p>
            <p>
              What started as a small kitchen experiment has grown into a beloved brand known for pushing the boundaries of flavor and texture. We believe ice cream isn't just a dessert—it's an experience.
            </p>
            <p>
              From our famous "Midnight Berries" to the classic "Golden Vanilla," every scoop is crafted with passion and precision.
            </p>
          </div>
        </section>

        {/* Team / Values */}
        <section className="section values-section">
          <h2 className="section-title text-center">Our Values</h2>
          <div className="values-grid">
            <div className="value-card glass-panel">
              <h3>🌱 Sustainable</h3>
              <p>We source ingredients from local, organic farms to support our community and planet.</p>
            </div>
            <div className="value-card glass-panel">
              <h3>❤️ Handcrafted</h3>
              <p>Made in small batches to ensure perfect quality in every single tub.</p>
            </div>
            <div className="value-card glass-panel">
              <h3>🤝 Community</h3>
              <p>We bring people together through the universal love of frozen treats.</p>
            </div>
          </div>
        </section>

        {/* Chefs Image Placeholder */}
        <section className="section team-section">
           <div className="glass-panel team-panel">
               <div className="team-text">
                   <h2>Meet the Makers</h2>
                   <p>Our team of expert gelato masters and flavor engineers working day and night to freeze moments of joy.</p>
               </div>
               <div className="team-image-placeholder">
                   <span>[Team Photo Placeholder]</span>
               </div>
           </div>
        </section>
      </div>

      {/* Decorative Glow */}
      <div className="glow glow-about"></div>
    </div>
  );
};

export default About;
