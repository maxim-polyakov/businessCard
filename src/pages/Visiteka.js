import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Container, Row, Col, Button, Badge } from 'react-bootstrap';
import './Visiteka.css';

const Visiteka = observer(() => {
    // Данные для сайта-визитки
    const profileData = {
        name: "Поляков Максим",
        position: "Full Stack Developer",
        description: "Привет! Я веб-разработчик с опытом создания современных и responsive веб-приложений. Специализируюсь на современных фреймворках.",
        email: "maxim7012@gmail.com",
        phone: "+7 (952)441-26-71",
        location: "Нижний Новгород, Россия",
        projects: [
            {
                title: 'Misa AI Chat',
                description: 'Веб-приложение для онлайн чата с моделями LLM chatgpt и dalle и многим другим.',
                technologies: ['React', 'Node.js', 'PostgreSQL', 'Chart.js'],
                url: 'https://misa.baxic.ru/',
                github: 'https://github.com/maxim-polyakov/Misa_bot'
            },
            {
                title: 'Misa AI Gallery',
                description: 'Сайт с рисунками Dalle сгенерированными мисой',
                technologies: ['React', 'Node.js', 'PostgreSQL', 'Chart.js'],
                url: 'https://misagallery.baxic.ru/gallery',
                github: 'https://github.com/maxim-polyakov/misadrawing'
            },
            {
                title: 'E-Commerce Platform',
                description: 'Полнофункциональная платформа электронной коммерции с корзиной покупок, системой оплаты и управлением товарами.',
                technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'React', 'REST API'],
                url: 'https://ecommerce.baxic.ru',
                github: 'https://github.com/maxim-polyakov/e-commerce-java-two'
            },
        ],
        socialLinks: [
            { name: 'GitHub', url: 'https://github.com/maxim-polyakov', icon: 'fab fa-github' },
            { name: 'Telegram', url: 'https://t.me/The_Baxic', icon: 'fab fa-telegram' }
        ]
    };

    return (
        <Container className="visiteka-container">
            {/* Шапка */}
            <Card className="profile-card mb-4">
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <div className="profile-info">
                                <h1 className="profile-name">{profileData.name}</h1>
                                <h2 className="profile-position">{profileData.position}</h2>
                                <p className="profile-description">{profileData.description}</p>

                                <div className="contact-info">
                                    <p><i className="fas fa-envelope"></i> {profileData.email}</p>
                                    <p><i className="fas fa-phone"></i> {profileData.phone}</p>
                                    <p><i className="fas fa-map-marker-alt"></i> {profileData.location}</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Проекты */}
            <Card className="projects-card mb-4">
                <Card.Body>
                    <h3 className="section-title">Мои проекты</h3>
                    <Row>
                        {profileData.projects.map((project, index) => (
                            <Col md={6} key={index} className="mb-4">
                                <Card className="project-item h-100">
                                    <Card.Body>
                                        <Card.Title className="project-title">
                                            {project.title}
                                        </Card.Title>
                                        <Card.Text className="project-description">
                                            {project.description}
                                        </Card.Text>
                                        <div className="technologies mb-3">
                                            {project.technologies.map((tech, techIndex) => (
                                                <Badge key={techIndex} bg="primary" className="me-1 mb-1">
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="project-links">
                                            {project.url && project.url !== '#' && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="me-2"
                                                    href={project.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="fas fa-external-link-alt me-1"></i>
                                                    Посмотреть проект
                                                </Button>
                                            )}
                                            {project.github && project.github !== '#' && (
                                                <Button
                                                    variant="outline-dark"
                                                    size="sm"
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="fab fa-github me-1"></i>
                                                    GitHub
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            {/* Социальные сети */}
            <Card className="social-card">
                <Card.Body>
                    <h3 className="section-title">Социальные сети</h3>
                    <div className="social-links text-center">
                        {profileData.socialLinks.map((social, index) => (
                            <Button
                                key={index}
                                variant="outline-primary"
                                className="social-btn me-2 mb-2"
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className={`${social.icon} me-2`}></i>
                                {social.name}
                            </Button>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
});

export default Visiteka;