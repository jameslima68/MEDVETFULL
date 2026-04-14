# MEDVET INTEGRATIVA - PRD

## Problema Original
Criar um site chamado MEDVET INTEGRATIVA de vendas de produtos de medicina veterinária integrativa com dicas de tratamento por especialistas veterinários. Produtos: homeopáticos, hormônios bioidênticos, manipulados da medicina chinesa, CBD e acupuntura. Baseado no modelo de negócios do site https://home.medvi.org/ mas voltado para medicina veterinária integrativa.

## Stack Técnica
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB
- Pagamentos: Stripe (ativo) + PIX (simulado)
- Autenticação: JWT
- Idioma: Português (PT-BR) — todos os textos com acentuação correta

## Funcionalidades Implementadas
- Autenticação JWT (login, registro, admin)
- Catálogo de produtos (49+ produtos, 7 categorias)
- Checkout Stripe + PIX simulado
- Sistema de cupons de desconto
- Programa de fidelidade (pontos)
- Assinaturas mensais
- Painel admin (stats, inventário, cupons, gráficos)
- Páginas educacionais: Guia de Pelagem, Calculadora de Dosagem
- Quiz dos 5 Elementos
- Página Acupuntura & MTC
- Catálogo de 29 Terapias
- Cromoterapia para pets
- Página da Equipe (com foto real da Dra. Tabatha Novikov - CRMV-SP 21194)
- Blog com artigos completos
- Calculadora de Sintomas interativa
- Depoimentos com suporte a vídeo URL
- Página Nossa Missão
- Notificações por email (MOCKED - logger)
- Histórico de compras
- **Revisão completa de acentuação PT-BR** (23 arquivos frontend + backend seed data)

## Credenciais
- Admin: admin@medvet.com / admin123

## APIs Principais
- POST /api/auth/login, /api/auth/register, GET /api/auth/me
- GET /api/products, POST /api/checkout, POST /api/pix/checkout
- GET /api/coupons/validate/{code}
- GET /api/admin/stats
- POST /api/testimonials/submit, GET /api/testimonials/approved
- GET /api/blog, GET /api/blog/{id}
- POST /api/symptom-calculator, GET /api/symptom-calculator/symptoms
- GET /api/subscriptions/plans, POST /api/subscriptions/subscribe

## Backlog (Priorizado)
- P1: Configurar domínio e DNS para emails profissionais (adiado pelo usuário)
- P2: Notificações push no navegador (adiado pelo usuário)
- P2: Integrar PIX real via Mercado Pago/PagSeguro
- P2: Refatorar server.py (1450+ linhas) em módulos separados (/routes, /models, /seeders)

## Features Simuladas/Mocked
- PIX: Gera QR code dummy e auto-aprova (sem Mercado Pago real)
- Email: Imprime no console do backend (sem SMTP/Resend real)
