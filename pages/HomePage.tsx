import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { mockTestimonials } from '../lib/data';
import { UploadIcon, AiIcon, SolutionIcon, ArrowRightIcon } from '../components/Icons';

const HomePage = () => {
  const { t, language } = useAppContext();
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    window.location.hash = hash;
  };

  const HowItWorksCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
      <div className="flex justify-center items-center mb-4 text-primary dark:text-primary-light">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-text-light dark:text-text-dark">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );

  const TestimonialSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (mockTestimonials.length === 0) return;
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % mockTestimonials.length);
      }, 5000);
      return () => clearInterval(timer);
    }, []);
    
    if (mockTestimonials.length === 0) {
        return null;
    }

    const currentTestimonial = mockTestimonials[currentIndex];

    return (
        <div className="relative w-full max-w-2xl mx-auto bg-primary-light/20 dark:bg-primary-dark/30 p-8 rounded-xl shadow-2xl">
            <div className="text-center">
                <img src={currentTestimonial.image} alt={currentTestimonial.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary dark:border-primary-light" />
                <p className="text-lg italic text-gray-700 dark:text-gray-200 mb-4">
                    "{language === 'te' ? currentTestimonial.quote_te : currentTestimonial.quote}"
                </p>
                <h4 className="font-bold text-xl text-primary dark:text-primary-light">{currentTestimonial.name}</h4>
                <p className="text-gray-500 dark:text-gray-400">{currentTestimonial.location}</p>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down font-sans">{t('hero_title')}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in-up">{t('hero_subtitle')}</p>
          <a href="#register" onClick={(e) => handleNavClick(e, 'register')} className="bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary-dark transition-transform transform hover:scale-105 inline-flex items-center gap-2">
            {t('try_demo')} <ArrowRightIcon/>
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('how_it_works')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <HowItWorksCard icon={<UploadIcon className="w-16 h-16" />} title={t('step_1_title')} description={t('step_1_desc')} />
            <HowItWorksCard icon={<AiIcon className="w-16 h-16" />} title={t('step_2_title')} description={t('step_2_desc')} />
            <HowItWorksCard icon={<SolutionIcon className="w-16 h-16" />} title={t('step_3_title')} description={t('step_3_desc')} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {mockTestimonials.length > 0 && (
        <section className="py-20 bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('testimonials_title')}</h2>
            <TestimonialSlider />
            </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;