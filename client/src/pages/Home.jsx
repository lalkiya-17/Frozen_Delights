import React from 'react';
import './Home.css';
import { ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const handleScroll = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-content container">
          <h1 className="hero-title">
            Taste the <span className="text-gradient ">Magic</span> of <br />
            Frozen Delights
          </h1>
          <p className="hero-subtitle">
            Premium ice creams, frozen yogurts, and desserts delivered to your doorstep.
            Experience the chill of perfection.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Link>
            <Link onClick={handleScroll('menu')} className="btn btn-outline">
              View Menu
            </Link>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </section>

      {/* Features Section */}
      <section className="section features" id="about">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon">🍦</div>
              <h3>Premium Quality</h3>
              <p>Made with 100% organic milk and natural ingredients.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon">🚀</div>
              <h3>Fast Delivery</h3>
              <p>Frozen delivery technology ensures your treats arrive perfectly chilled.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon">🛡️</div>
              <h3>Safety First</h3>
              <p>Hygienic packaging and contactless delivery for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog / Our Flavors Section */}
      <section className="section catalog-preview" id="menu">
        <div className="container">
          <h2 className="section-title text-center">Our <span className="text-gradient">Flavors</span></h2>
          <div className="products-grid">
            {[
              {
                id: 1,
                name: "Midnight Berries",
                price: 350,
                description: "Dark chocolate infused with forest berries.",
                image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80"
              },
              {
                id: 2,
                name: "Golden Vanilla",
                price: 250,
                description: "Classic Madagascar vanilla with honeycomb chunks.",
                image: "https://images.unsplash.com/photo-1557142046-c704a3adf364?w=800&auto=format&fit=crop&q=60"
              },
              {
                id: 3,
                name: "Pistachio Dream",
                price: 450,
                description: "Creamy pistachio with roasted nuts.",
                image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80"
              },
              {
                id: 4,
                name: "Mango Tango",
                price: 300,
                description: "Tropical Alphonso mango sorbet.",
                image: "https://images.unsplash.com/photo-1515037028865-0a2a82603f7c?w=800&auto=format&fit=crop&q=60"
              },
            ].map(product => (
              <div key={product.id} className="product-card glass-panel">
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">₹{product.price}</span>
                    <span className="text-secondary" style={{fontSize: '0.9rem', opacity: 0.8}}>Login to Order</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-title text-center">Sweet <span className="text-gradient">Words</span></h2>
          <div className="testimonials-grid">
            <div className="testimonial-card glass-panel">
              <p>"The Midnight Berries flavor is absolutely divine! I've never tasted anything like it."</p>
              <h4>- Sarah J.</h4>
            </div>
            <div className="testimonial-card glass-panel">
              <p>"Fast delivery and the ice cream was still perfectly frozen. My kids loved the Mango Tango!"</p>
              <h4>- Mike T.</h4>
            </div>
            <div className="testimonial-card glass-panel">
              <p>"Finally, a premium dessert place that delivers on quality. Highly recommended!"</p>
              <h4>- Emily R.</h4>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta" id='signup'>
        <div className="container cta-container glass-panel ">
          <h2>Ready to Indulge?</h2>
          <p>Join thousands of happy customers enjoying the best frozen desserts in town.</p>
          <Link to="/register" className="btn btn-primary">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
