# MEDVET INTEGRATIVA - PRD

## Problema Original
Site de vendas de produtos de medicina veterinária integrativa com dicas de tratamento por especialistas veterinários.

## Stack Técnica
React + FastAPI + MongoDB + Tailwind CSS + Shadcn UI + Stripe + JWT

## Funcionalidades Implementadas
- Autenticação JWT (login, registro, admin)
- Catálogo de produtos (77+ produtos, 9 categorias)
- **Homepage com showcase de 25+ terapias integrativas** (sem produtos/preços)
- **Menu lateral slide-in** estilo MEDVi com 11 itens de tratamento
- **Página "Produtos por Tratamento"** (/loja) — produtos organizados por segmento com apelo sutil ao consumo
- **Terapia Alimentar** (/terapia-alimentar) — alimentação cetogênica, natural e funcional + 8 produtos
- Checkout Stripe + PIX simulado
- Cupons, Fidelidade, Assinaturas
- Painel admin (stats, inventário, cupons)
- Guia de Pelagem, Calculadora de Dosagem
- Quiz dos 5 Elementos, Acupuntura & MTC
- 29 Terapias, Cromoterapia, Blog, Calculadora de Sintomas
- Equipe (Dra. Tabatha Novikov CRMV-SP 21194)
- Depoimentos com vídeo, Nossa Missão
- Acentuação PT-BR corrigida em 23+ arquivos

## Credenciais
- Admin: admin@medvet.com / admin123

## Rotas Principais
/, /missao, /produtos, /loja, /terapia-alimentar, /consultas, /acupuntura-mtc, /terapias, /equipe, /depoimentos, /blog, /guia-pelagem, /assinaturas, /quiz-elemento, /calculadora-tratamento

## Backlog
- P1: Deploy + domínio medvetintegrativa.com
- P2: PIX real via Mercado Pago
- P2: Notificações push
- P2: Refatorar server.py em módulos

## Mocked
- PIX simulado, Email via logger
