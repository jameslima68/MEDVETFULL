# MEDVET INTEGRATIVA - PRD

## Problema Original
Criar um site chamado MEDVET INTEGRATIVA de vendas de produtos de medicina veterinaria integrativa com dicas de tratamento por especialistas veterinarios. Produtos: homeopaticos, hormonios bioidenticos, manipulados da medicina chinesa, CBD e acupuntura. Baseado no modelo de negocios do site https://home.medvi.org/ mas voltado para medicina veterinaria integrativa.

## Stack Tecnica
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB
- Pagamentos: Stripe (ativo) + PIX (simulado)
- Autenticacao: JWT
- Idioma: Portugues (PT-BR)

## Funcionalidades Implementadas
- Autenticacao JWT (login, registro, admin)
- Catalogo de produtos (49+ produtos, 7 categorias)
- Checkout Stripe + PIX simulado
- Sistema de cupons de desconto
- Programa de fidelidade (pontos)
- Assinaturas mensais
- Painel admin (stats, inventario, cupons, graficos)
- Paginas educacionais: Guia de Pelagem, Calculadora de Dosagem
- Quiz dos 5 Elementos
- Pagina Acupuntura & MTC
- Catalogo de 29 Terapias
- Cromoterapia para pets
- Pagina da Equipe (com foto real da Dra. Tabatha Novikov - CRMV-SP 21194)
- Blog com artigos completos
- Calculadora de Sintomas interativa
- Depoimentos com suporte a video URL
- Pagina Nossa Missao
- Notificacoes por email (MOCKED - logger)
- Historico de compras

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
- P1: Configurar dominio e DNS para emails profissionais (adiado pelo usuario)
- P2: Notificacoes push no navegador (adiado pelo usuario)
- P2: Integrar PIX real via Mercado Pago/PagSeguro
- P2: Refatorar server.py (1400+ linhas) em modulos separados (/routes, /models, /seeders)

## Features Simuladas/Mocked
- PIX: Gera QR code dummy e auto-aprova (sem Mercado Pago real)
- Email: Imprime no console do backend (sem SMTP/Resend real)
