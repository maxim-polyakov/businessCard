import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import LanguageSelector from '../components/LanguageSelector';
import { useLocale } from '../i18n/LocaleContext';
import './Visiteka.css';

const Visiteka = observer(() => {
    const { t } = useLocale();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3016/api';
    const formatApiError = (detail) => {
        if (!detail) {
            return t('submitError');
        }

        if (typeof detail === 'string') {
            return detail;
        }

        if (Array.isArray(detail)) {
            return detail
                .map((item) => item?.msg || item?.message || JSON.stringify(item))
                .join('; ');
        }

        return detail.message || JSON.stringify(detail);
    };

    const initialFormState = {
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        consent: false,
        attachments: [],
    };
    const [formData, setFormData] = useState(initialFormState);
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const profileData = {
        name: t('profileName'),
        position: t('profilePosition'),
        description: t('profileDescription'),
        email: 'maxim7012@gmail.com',
        phone: '+7 (952) 441-26-71',
        location: t('profileLocation'),
        stats: [
            { value: '5+', label: t('statProjects') },
            { value: 'Fullstack', label: t('statFullstack') },
            { value: '24/7', label: t('statOnline') },
        ],
        services: [
            {
                number: '01',
                title: t('serviceWebTitle'),
                tags: ['React', 'Node.js', 'Django', 'REST API'],
                description: t('serviceWebDescription'),
            },
            {
                number: '02',
                title: t('serviceBackendTitle'),
                tags: ['Java', 'Spring Boot', 'Python', 'PostgreSQL'],
                description: t('serviceBackendDescription'),
            },
            {
                number: '03',
                title: t('serviceAiTitle'),
                tags: ['OpenAI API', 'WebSocket', 'AI Chat', 'Automation'],
                description: t('serviceAiDescription'),
            },
        ],
        projects: [
            {
                title: 'Misa AI Chat',
                description: t('misaDescription'),
                technologies: ['React', 'Django', 'Python', 'OpenAI API', 'PostgreSQL'],
                url: 'https://misa.baxic.ru/',
                github: 'https://github.com/maxim-polyakov/Misa_bot',
            },
            {
                title: 'Misa AI Gallery',
                description: t('galleryDescription'),
                technologies: ['React', 'Express', 'PostgreSQL', 'Bootstrap'],
                url: 'https://misagallery.baxic.ru',
                github: 'https://github.com/maxim-polyakov/misadrawing',
            },
            {
                title: 'E-Commerce Platform',
                description: t('ecommerceDescription'),
                technologies: ['Java', 'Spring Boot', 'React', 'JWT', 'PostgreSQL'],
                url: 'https://ecommerce.baxic.ru',
                github: 'https://github.com/maxim-polyakov/e-commerce-java-two',
            },
            {
                title: t('canbanTitle'),
                description: t('canbanDescription'),
                technologies: ['React', 'JavaScript', 'C#', 'Docker'],
                url: 'https://canban.baxic.ru/',
                github: 'https://github.com/maxim-polyakov/canban_desktop',
            },
            {
                title: 'Lotus Game',
                description: t('lotusDescription'),
                technologies: ['Java', 'JavaScript', 'CSS'],
                url: 'https://lotus.baxic.ru/',
                github: 'https://github.com/maxim-polyakov/lotus_game',
            },
        ],
        socialLinks: [
            { name: 'GitHub', url: 'https://github.com/maxim-polyakov', icon: 'fab fa-github' },
            { name: 'Telegram', url: 'https://t.me/The_Baxic', icon: 'fab fa-telegram' },
        ],
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked, files } = event.target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: type === 'checkbox' ? checked : files ? Array.from(files) : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFormStatus({ type: '', message: '' });

        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('email', formData.email);
        payload.append('message', formData.message);
        payload.append('consent', String(formData.consent));

        if (formData.company) {
            payload.append('company', formData.company);
        }

        if (formData.phone) {
            payload.append('phone', formData.phone);
        }

        formData.attachments.forEach((file) => {
            payload.append('attachments', file);
        });

        try {
            const response = await fetch(`${apiUrl}/contact`, {
                method: 'POST',
                body: payload,
            });
            const contentType = response.headers.get('content-type') || '';
            const isJsonResponse = contentType.includes('application/json');
            const result = isJsonResponse ? await response.json() : {};

            if (!response.ok) {
                throw new Error(formatApiError(result.detail));
            }

            if (!isJsonResponse || result.ok !== true) {
                throw new Error(t('invalidApiResponse'));
            }

            setFormData(initialFormState);
            event.target.reset();
            setFormStatus({
                type: 'success',
                message: t('submitSuccess'),
            });
        } catch (error) {
            setFormStatus({
                type: 'error',
                message: error.message || t('submitError'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="visiteka-page">
            <Container className="visiteka-container">
                <header className="topbar">
                    <a className="brand" href="#top" aria-label={t('homeAria')}>
                        <span className="brand-mark">B</span>
                        <span> BAXIC.DEV</span>
                    </a>
                    <nav className="topbar-nav" aria-label={t('homeAria')}>
                        <a href="#services">{t('navServices')}</a>
                        <a href="#projects">{t('navProjects')}</a>
                        <a href="#contacts">{t('navContacts')}</a>
                    </nav>
                    <LanguageSelector />
                </header>

                <section className="hero-section" id="top">
                    <Row className="align-items-end g-4">
                        <Col lg={12}>
                            <p className="eyebrow">{t('heroEyebrow')}</p>
                            <h1 className="hero-title">{t('heroTitle')}</h1>
                            <p className="hero-description">{profileData.description}</p>
                            <div className="hero-actions">
                                <Button className="primary-action" href="#contacts">
                                    {t('discussProject')}
                                </Button>
                                <Button className="ghost-action" href="#projects">
                                    {t('viewWork')}
                                </Button>
                            </div>
                        </Col>
                        <Col lg={12}>
                            <aside className="profile-panel">
                                <span className="panel-label">{t('developerLabel')}</span>
                                <h2>{profileData.name}</h2>
                                <p>{profileData.position}</p>
                                <div className="profile-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    {profileData.location}
                                </div>
                            </aside>
                        </Col>
                    </Row>
                </section>

                <section className="stats-grid" aria-label={t('servicesTitle')}>
                    {profileData.stats.map((stat) => (
                        <div className="stat-card" key={stat.label}>
                            <strong>{stat.value}</strong>
                            <span>{stat.label}</span>
                        </div>
                    ))}
                </section>

                <section className="content-section" id="services">
                    <div className="section-heading">
                        <p className="eyebrow">{t('servicesEyebrow')}</p>
                        <h2>{t('servicesTitle')}</h2>
                    </div>
                    <div className="service-list">
                        {profileData.services.map((service) => (
                            <article className="service-card" key={service.number}>
                                <span className="service-number">{service.number}</span>
                                <div>
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                    <div className="tag-row">
                                        {service.tags.map((tag) => (
                                            <Badge key={tag} className="tech-badge">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="content-section" id="projects">
                    <div className="section-heading">
                        <p className="eyebrow">{t('portfolioEyebrow')}</p>
                        <h2>{t('portfolioTitle')}</h2>
                    </div>
                    <Row className="g-4">
                        {profileData.projects.map((project, index) => (
                            <Col lg={6} key={project.title}>
                                <article className="project-card">
                                    <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
                                    <h3>{project.title}</h3>
                                    <p>{project.description}</p>
                                    <div className="tag-row">
                                        {project.technologies.map((tech) => (
                                            <Badge key={tech} className="tech-badge">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="project-links">
                                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                                            {t('projectLink')} <i className="fas fa-arrow-up-right-from-square"></i>
                                        </a>
                                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                                            GitHub <i className="fab fa-github"></i>
                                        </a>
                                    </div>
                                </article>
                            </Col>
                        ))}
                    </Row>
                </section>

                <section className="contact-section" id="contacts">
                    <div className="contact-copy">
                        <p className="eyebrow">{t('contactEyebrow')}</p>
                        <h2>{t('contactTitle')}</h2>
                        <p>{t('contactDescription')}</p>
                        <div className="contact-grid">
                            <a href={`mailto:${profileData.email}`}>
                                <span>01</span>
                                <strong>{profileData.email}</strong>
                            </a>
                            <a href={`tel:${profileData.phone.replace(/[^\d+]/g, '')}`}>
                                <span>02</span>
                                <strong>{profileData.phone}</strong>
                            </a>
                            {profileData.socialLinks.map((social, index) => (
                                <a href={social.url} key={social.name} target="_blank" rel="noopener noreferrer">
                                    <span>{String(index + 3).padStart(2, '0')}</span>
                                    <strong>
                                        <i className={social.icon}></i> {social.name}
                                    </strong>
                                </a>
                            ))}
                        </div>
                    </div>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label>
                                <span>01 {t('formNameLabel')}</span>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder={t('formNamePlaceholder')}
                                    minLength="2"
                                    maxLength="120"
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                <span>02 {t('formCompanyLabel')}</span>
                                <input
                                    name="company"
                                    type="text"
                                    placeholder={t('formCompanyPlaceholder')}
                                    maxLength="160"
                                    onChange={handleInputChange}
                                />
                            </label>
                        </div>
                        <div className="form-row">
                            <label>
                                <span>03 {t('formEmailLabel')}</span>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder={t('formEmailPlaceholder')}
                                    required
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                <span>04 {t('formPhoneLabel')}</span>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder={t('formPhonePlaceholder')}
                                    maxLength="40"
                                    onChange={handleInputChange}
                                />
                            </label>
                        </div>
                        <label>
                            <span>05 {t('formMessageLabel')}</span>
                            <textarea
                                name="message"
                                placeholder={t('formMessagePlaceholder')}
                                minLength="5"
                                maxLength="4000"
                                rows="4"
                                required
                                onChange={handleInputChange}
                            />
                        </label>
                        <label className="file-field">
                            <input
                                name="attachments"
                                type="file"
                                accept=".jpg,.jpeg,.png,.bmp,.gif,.pdf,.doc,.docx,.txt"
                                multiple
                                onChange={handleInputChange}
                            />
                            <span>
                                <i className="fas fa-paperclip"></i>
                                {formData.attachments.length > 0
                                    ? t('selectedFiles').replace('{count}', String(formData.attachments.length))
                                    : t('attachFiles')}
                            </span>
                            {formData.attachments.length > 0 && (
                                <ul className="file-list">
                                    {formData.attachments.map((file) => (
                                        <li key={`${file.name}-${file.size}`}>{file.name}</li>
                                    ))}
                                </ul>
                            )}
                            <small>{t('fileTypes')}</small>
                        </label>
                        <label className="checkbox-field">
                            <input
                                name="consent"
                                type="checkbox"
                                required
                                checked={formData.consent}
                                onChange={handleInputChange}
                            />
                            <span>{t('consent')}</span>
                        </label>
                        <Button className="primary-action form-submit" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('sending') : t('send')}
                        </Button>
                        {formStatus.message && (
                            <p className={`form-status ${formStatus.type}`}>{formStatus.message}</p>
                        )}
                    </form>
                </section>
            </Container>
        </main>
    );
});

export default Visiteka;