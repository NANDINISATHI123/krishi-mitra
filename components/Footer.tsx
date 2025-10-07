

import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';

const Footer = () => {
    const { t } = useAppContext();
    return (
        <footer className="bg-primary-dark text-white p-4 text-center">
            <p>{t('footer_text')}</p>
        </footer>
    );
};

export default Footer;