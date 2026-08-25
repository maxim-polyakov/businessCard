import React from 'react';
import { observer } from 'mobx-react-lite';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import './Visiteka.css';

const Visiteka = observer(() => {
    const profileData = {
        name: 'Поляков Максим',
        position: 'Full Stack Developer',
        description: 'Проектирую и разрабатываю веб-приложения, AI-сервисы, e-commerce и backend-системы. Беру задачу от идеи и прототипа до запуска, интеграций и поддержки.',
        email: 'maxim7012@gmail.com',
        phone: '+7 (952) 441-26-71',
        location: 'Нижний Новгород, Россия',
        stats: [
            { value: '5+', label: 'запущенных проектов' },
            { value: 'Fullstack', label: 'фронтенд + backend' },
            { value: '24/7', label: 'сайт доступен онлайн' },
        ],
        services: [
            {
                number: '01',
                title: 'Веб-разработка и интеграции',
                tags: ['React', 'Node.js', 'Django', 'REST API'],
                description: 'Создаю сайты, личные кабинеты и сервисы с понятной архитектурой, адаптивным интерфейсом и подключением внешних API.',
            },
            {
                number: '02',
                title: 'Backend и бизнес-логика',
                tags: ['Java', 'Spring Boot', 'Python', 'PostgreSQL'],
                description: 'Разрабатываю серверную часть, авторизацию, базы данных, административные панели и надежные сценарии обработки данных.',
            },
            {
                number: '03',
                title: 'AI-продукты и автоматизация',
                tags: ['OpenAI API', 'WebSocket', 'AI Chat', 'Automation'],
                description: 'Интегрирую AI-инструменты в продукты: чат-боты, генерацию изображений, автоматизацию рутинных процессов и прототипы MVP.',
            },
        ],
        projects: [
            {
                title: 'Misa AI Chat',
                description: 'AI-чат с поддержкой ChatGPT, DALL-E и WebSocket-обмена сообщениями.',
                technologies: ['React', 'Django', 'Python', 'OpenAI API', 'PostgreSQL'],
                url: 'https://misa.baxic.ru/',
                github: 'https://github.com/maxim-polyakov/Misa_bot',
            },
            {
                title: 'Misa AI Gallery',
                description: 'Галерея изображений, сгенерированных через DALL-E, с удобной витриной работ.',
                technologies: ['React', 'Express', 'PostgreSQL', 'Bootstrap'],
                url: 'https://misagallery.baxic.ru',
                github: 'https://github.com/maxim-polyakov/misadrawing',
            },
            {
                title: 'E-Commerce Platform',
                description: 'Интернет-магазин с корзиной, авторизацией, REST API и backend на Spring Boot.',
                technologies: ['Java', 'Spring Boot', 'React', 'JWT', 'PostgreSQL'],
                url: 'https://ecommerce.baxic.ru',
                github: 'https://github.com/maxim-polyakov/e-commerce-java-two',
            },
            {
                title: 'Канбан',
                description: 'Клиент-серверное приложение с доской задач, квестами и уровнями.',
                technologies: ['React', 'JavaScript', 'C#', 'Docker'],
                url: 'https://canban.baxic.ru/',
                github: 'https://github.com/maxim-polyakov/canban_desktop',
            },
        ],
        socialLinks: [
            { name: 'GitHub', url: 'https://github.com/maxim-polyakov', icon: 'fab fa-github' },
            { name: 'Telegram', url: 'https://t.me/The_Baxic', icon: 'fab fa-telegram' },
        ],
    };

    return (
        <main className="visiteka-page">
            <Container className="visiteka-container">
                <header className="topbar">
                    <a className="brand" href="#top" aria-label="На главную">
                        <span className="brand-mark">B</span>
                        <span> BAXIC.DEV</span>
                    </a>
                    <nav className="topbar-nav" aria-label="Основная навигация">
                        <a href="#services">Услуги</a>
                        <a href="#projects">Проекты</a>
                        <a href="#contacts">Контакты</a>
                    </nav>
                </header>

                <section className="hero-section" id="top">
                    <Row className="align-items-end g-4">
                        <Col lg={8}>
                            <p className="eyebrow">[ Персональная разработка ]</p>
                            <h1 className="hero-title">Реализую IT-решения для бизнеса и личных продуктов</h1>
                            <p className="hero-description">{profileData.description}</p>
                            <div className="hero-actions">
                                <Button className="primary-action" href="#contacts">
                                    Обсудить проект
                                </Button>
                                <Button className="ghost-action" href="#projects">
                                    Смотреть работы
                                </Button>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <aside className="profile-panel">
                                <span className="panel-label">Разработчик</span>
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

                <section className="stats-grid" aria-label="Краткая статистика">
                    {profileData.stats.map((stat) => (
                        <div className="stat-card" key={stat.label}>
                            <strong>{stat.value}</strong>
                            <span>{stat.label}</span>
                        </div>
                    ))}
                </section>

                <section className="content-section" id="services">
                    <div className="section-heading">
                        <p className="eyebrow">[ Услуги ]</p>
                        <h2>Что могу закрыть</h2>
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
                        <p className="eyebrow">[ Портфолио ]</p>
                        <h2>Проекты</h2>
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
                                            Проект <i className="fas fa-arrow-up-right-from-square"></i>
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
                    <div>
                        <p className="eyebrow">[ Обсудить, посоветоваться, спросить ]</p>
                        <h2>Связаться со мной</h2>
                    </div>
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
                </section>
            </Container>
        </main>
    );
});

export default Visiteka;